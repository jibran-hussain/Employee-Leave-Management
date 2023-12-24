import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import {dirname} from 'path';
import jwt from 'jsonwebtoken';
import { isValidEmail,passwordValidation } from "../utils/validations.js";
import { generateId } from '../utils/generateId.js';
import { generateHashedPassword } from '../utils/generateHashedPassword.js';
import { generateAuthToken } from '../utils/geneateAuthToken.js';
import { isValidPassword } from '../utils/isValidPassword.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export const createUser=async(req,res)=>{
    try{
        const {name,email,password,role}=req.body;
        if(!name ||!email || !password || !role) return res.json({message:'All fields are mandatory'})

        // Check if it is a valid email or not
        if(!isValidEmail(email)) return res.status(400).json({error:"Please enter valid email address"})

        // Checks whether password is Empty
        if(passwordValidation(password)) return res.status(400).json({error:`Password cannot be empty and should have more than 3 characters`})

        if(role === 'admin'){
            if(req.auth.role != 'superadmin') return res.status(403).json({error:'You are not authorized to create an admin. Please login as superadmin'})
            const data=await fs.readFile(`${__dirname}/../../db/admin.json`,'utf8')
            const fileData=JSON.parse(data);

            // Check whether admin of this email-id already exists or not
            const isExisting=fileData.admins.some((admin)=>admin.email === email);
            if(isExisting) return res.status(500).json({error:"Admin with this email already exists. Please try with another email id"})
            
            // gnereate admin id 
            let adminId= await generateId("admin");

            // Hashing the password
            const hashedPassword=generateHashedPassword(password);

            const newAdmin={adminId,name,email,hashedPassword,role:"admin",leavesLeft:20,leaves:[]};

            fileData.admins.push(newAdmin);
            const newFileData=JSON.stringify(fileData)
            await fs.writeFile(`${__dirname}/../../db/admin.json`,newFileData,'utf8')

            // generate auth token
            const token=generateAuthToken(adminId,email,"admin")

            // Set cookie
            res.cookie('jwt',token,{
                httpOnly:true
                })

            return res.json({message:`Admin created successfully`});
        }
        else if(role === "employee"){
            console.log(req.auth)
            // Fetching the file and adding new employees
            if(req.auth.role != 'superadmin' &&  req.auth.role != 'admin') return res.status(403).json({error:'You are not authorized to create an employee. Please login as admin or superadmin'})
            const data= await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
            const fileData=JSON.parse(data);

            // Check whether employee of this email-id already exists or not
            const isExisting=fileData.employees.some((employee)=>employee.email === email);
            if(isExisting) return res.status(500).json({error:"Employee with this email already exists. Please try with another email id"})

            // Get the employeeId for the new employee
            let employeeId=await generateId("employee");

            // Hashing the password
            const hashedPassword=generateHashedPassword(password);
            
            const newEmployee={employeeId,name,email,hashedPassword,role:"employee",leavesLeft:20,leaveDetails:[],createdBy:req.auth.id};
            fileData.employees.push(newEmployee);
            const newFileData=JSON.stringify(fileData)

            // Saving the new employee in JSON database
            await fs.writeFile(`${__dirname}/../../db/employee.json`,newFileData,'utf8')
            const token=generateAuthToken(employeeId,email,"employee")
            res.cookie('jwt',token,{
                httpOnly:true
                })
            return res.json({message:`Employee created successfully`});
        }else{
            return res.status(400).json({error:`Please enter a valid role   `})
        }
                
            
    }catch(e){
        console.log(e)
        return res.json({error:e.message})
    }
}

export const userSignin=async(req,res)=>{
    try{
        const {email,password,role}=req.body;
        if(!email || !password || !role) return res.status(400).json({message:`All fields are necassary`})  

        // Check if it is a valid email or not
        if(!isValidEmail(email)) return res.status(400).json({error:"Please enter valid email address"})

        // Checks whether password is Empty
        if(passwordValidation(password)) return res.status(400).json({error:`Password cannot be empty`})

        if(role === "employee"){
        const data= await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        const employee=fileData.employees.filter((employee)=>{
             if(employee.email === email && isValidPassword(password,employee.hashedPassword)) return true;
              })
         if(employee.length > 0){
                 const token=generateAuthToken(employee[0].employeeId,employee[0].email,role)
                 res.cookie('jwt',token,{
                       httpOnly:true
                    })
                 return res.json({
                         token
                    })
          }else{
                return res.status(400).json({message:`Invalid credentials`})
            }
                 
        }else if(role === 'admin'){
            const data=await fs.readFile(`${__dirname}/../../db/admin.json`,'utf8')
            const fileData=JSON.parse(data);
            const admin=fileData.admins.filter((admin)=>{
                    if(admin.email === email && isValidPassword(password,admin.hashedPassword)) return true;
                })
            if(admin.length > 0){
                    const token=jwt.sign({id:admin[0].adminId,email:admin[0].email,role:"admin"},process.env.JWT_SECRET_KEY);
                    res.cookie('jwt',token,{
                        httpOnly:true
                    })
                    return res.json({
                        token
                    })
                }else{
                    return res.status(400).json({message:`Invalid credentials`})
                }
        }else if(role === 'superadmin'){
            const data= await fs.readFile(`${__dirname}/../../db/superadmin.json`,'utf8')
            const fileData=JSON.parse(data);                    
                 
            if(email === fileData.superadmin.email && isValidPassword(password,fileData.superadmin.password)){

            const token=jwt.sign({id:fileData.superadmin.superadminId,email:fileData.superadmin.email,role:"superadmin"},process.env.JWT_SECRET_KEY);
            res.cookie('jwt',token,{
                     httpOnly:true
                 })
            return res.json({
                 token
             })
         }else{
             return res.status(400).json({error:"Invalid Credentials. Please try again"})
         }
        }
        else{
                return res.json({error:`Invalid credentials`})
            }
        
    }catch(e){
        console.log(e)
       return res.json({error:e.message})
    }
}