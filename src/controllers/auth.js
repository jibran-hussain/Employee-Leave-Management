import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import {dirname} from 'path';
import jwt from 'jsonwebtoken';
import { isValidEmail,passwordValidation } from "../utils/Validation/validations.js";
import { generateId } from '../utils/generateId.js';
import { generateHashedPassword } from '../utils/Auth/generateHashedPassword.js';
import { generateAuthToken } from '../utils/Auth/geneateAuthToken.js';
import { isValidPassword } from '../utils/Validation/isValidPassword.js'
import { isValidNumber } from '../utils/Validation/isValidMobile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)


// Creates an admin/employee wiht name,email,password,role,mobileNumber and salary as mandatory fileds.
// Admin can only be created by Superadmin.
// Employee can be created by both Superadmin and Admin.

export const createUser=async(req,res)=>{
    try{
        const {name,email,password,role,mobileNumber,salary}=req.body;
        if(!name ||!email || !password || !role || !mobileNumber ||!salary) return res.json({message:'All fields are mandatory'})

        // Check if it is a valid email or not
        if(!isValidEmail(email)) return res.status(400).json({error:"Please enter valid email address"})

        // Checks whether password is Empty
        if(passwordValidation(password)) return res.status(400).json({error:`Password cannot be empty and should have more than 3 characters`})

        // checks if a number is valid or not
        isValidNumber(mobileNumber);

        // Validatin salary
        if(!Number(salary)) return res.status(400).json("Please enter a valid salary")

        // Fetching the data from users.json file
        const data= await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);

        // Check whether employee of this email-id already exists or not
        const isExisting=fileData.users.some((user)=>user.email === email);
        if(isExisting) return res.status(500).json({error:"Employee with this email already exists. Please try with another email id"})

        // gnereate admin id 
        let id= await generateId("user");

        if(role === 'admin'){
            if(req.auth.role != 'superadmin') return res.status(403).json({error:'You are not authorized to create an admin. Please login as superadmin'})
            const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
            const fileData=JSON.parse(data);

            // Check whether admin of this email-id already exists or not
            const isExisting=fileData.users.some((user)=>user.email === email);
            if(isExisting) return res.status(500).json({error:"Admin with this email already exists. Please try with another email id"})

            // Hashing the password
            const hashedPassword=generateHashedPassword(password);

            const newAdmin={id,role:"admin",name,email,hashedPassword,mobileNumber,leavesLeft:20,leaveDetails:[],active:true};

            fileData.users.push(newAdmin);
            const newFileData=JSON.stringify(fileData)
            await fs.writeFile(`${__dirname}/../../db/users.json`,newFileData,'utf8')

            // generate auth jwt token
            const token=generateAuthToken(id,email,"admin")

            return res.status(201).json({message:`Admin created successfully`});
        }
        else if(role === "employee"){
            // Fetching the file and adding new employees
            if(req.auth.role != 'superadmin' &&  req.auth.role != 'admin') return res.status(403).json({error:'You are not authorized to create an employee. Please login as admin or superadmin'})

            // Get the employeeId for the new employee
            let id=await generateId("user");

            // Hashing the password
            const hashedPassword=generateHashedPassword(password);
            
            const newEmployee={id,role:"employee",name,email,hashedPassword,mobileNumber,leavesLeft:20,leaveDetails:[],active:true,createdBy:req.auth.id};
            fileData.users.push(newEmployee);
            const newFileData=JSON.stringify(fileData)

            // Saving the new employee in JSON database
            await fs.writeFile(`${__dirname}/../../db/users.json`,newFileData,'utf8')
            const token=generateAuthToken(id,email,"employee")
            return res.json({message:`Employee created successfully`});
        }else{
            return res.status(201).status(400).json({error:`Please enter a valid role`})
        }
    }catch(e){
        console.log(e)
        return res.json({error:e.message})
    }
}

// Superadmin,admin,employees can signin.
// name and password are mandatory fields.

export const userSignin=async(req,res)=>{
    try{
        const {email,password}=req.body; 
        if(!email || !password) return res.status(400).json({message:`All fields are necassary`})  

        // Check if it is a valid email or not
        if(!isValidEmail(email)) return res.status(400).json({error:"Please enter valid email address"})

        // Checks whether password is Empty
        if(passwordValidation(password)) return res.status(400).json({error:`Password cannot be empty`})

        const data= await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);

        let isDeactivated=false;
        
        const user=fileData.users.filter((user)=>{
            if(user.email === email && isValidPassword(password,user.hashedPassword)){
                if(user.active === false) isDeactivated=true;
                return true;
            };
            return false
              })

        if(isDeactivated) return res.status(403).json({error:'Your account has been deactivated by the admin'})
         if(user.length > 0){
                 const token=generateAuthToken(user[0].id,user[0].email,user[0].role)
                 return res.json({
                         token
                    })
          }else{
                return res.status(400).json({message:`Invalid credentials`})
            }
    }catch(e){
        console.log(e)
       return res.json({error:e.message})
    }
}



