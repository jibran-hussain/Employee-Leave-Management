import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import {dirname} from 'path';
import { isValidEmail,passwordValidation } from "../utils/Validation/validations.js";
import { generateHashedPassword } from '../utils/Auth/generateHashedPassword.js';
import { generateAuthToken } from '../utils/Auth/geneateAuthToken.js';
import { isValidPassword } from '../utils/Validation/isValidPassword.js'
import { isValidNumber } from '../utils/Validation/isValidMobile.js';
import Employee from '../models/employee.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)


// Creates an admin/employee wiht name,email,password,role,mobileNumber and salary as mandatory fileds.
// Admin can only be created by Superadmin.
// Employee can be created by both Superadmin and Admin.

export const createUser=async(req,res)=>{
    try{
        const {name,email,password,role,mobileNumber,salary}=req.body;

        if(!name ||!email || !password || !role || !mobileNumber ||!salary) return res.json({message:'All fields are mandatory'})

        if(role != 'admin' && role != 'employee') return res.status(400).json({error:`Please enter a valid role`})

        if(role === 'admin' && req.auth.role != 'superadmin') return res.status(403).json({error:'You are not authorized to create an admin. Please login as superadmin'});
        if(role === "employee" && (req.auth.role != 'superadmin' ||  req.auth.role != 'admin')) return res.status(403).json({error:'You are not authorized to create an employee. Please login as admin or superadmin'})

        // Check if it is a valid email or not
        if(!isValidEmail(email)) return res.status(400).json({error:"Please enter valid email address"})

        // Checks whether password is Empty
        if(passwordValidation(password)) return res.status(400).json({error:`Password cannot be empty and should have more than 3 characters`})

        // checks if a number is valid or not
        isValidNumber(mobileNumber);

        // Validatin salary
        if(!Number(salary) && salary < 0) return res.status(400).json("Please enter a valid salary")

        // Check whether employee of this email-id already exists or not
        const isEmailExisting=await Employee.findOne({where:{
            email:email.toLowerCase()
        }})

        if(isEmailExisting) return res.status(409).json({error:"Admin with this email already exists. Please try with another email id"})
            
        // Hashing the password
        const hashedPassword=generateHashedPassword(password);

        await Employee.create({name,email:email.toLowerCase(),hashedPassword,mobileNumber,salary,role});

        return res.status(201).json({message:`Employee created successfully`});
        
    }catch(e){
        return res.status(500).json({error:`Internal Server Error`})
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
        if(passwordValidation(password)) return res.status(400).json({error:`Password cannot be empty and should have more than 3 characters`})

        const employee=await Employee.findOne({where:{email:email.toLowerCase()}})
        
        if(!employee) return res.status(401).json({error:`Invalid credentials`});

        if(isValidPassword(password,employee.hashedPassword)){
            if(employee.active === false) return res.status(403).json({error:'Your account has been deactivated'})
            const token=generateAuthToken(employee.id,employee.email.toLowerCase(),employee.role)
                 return res.json({
                         token
                    })
        }else return res.status(401).json({error:`Invalid credentials`})
    }catch(e){
       return res.status(500).json({error:`Internal Server Error`})
    }
}



