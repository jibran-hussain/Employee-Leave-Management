import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import jwt from 'jsonwebtoken'
import 'dotenv/config'

import { generateAuthToken } from '../utils/geneateAuthToken.js';
import { generateId } from '../utils/generateId.js';
import { generateHashedPassword } from '../utils/generateHashedPassword.js';
import { isValidPassword } from '../utils/isValidPassword.js';
import { isValidEmail,passwordValidation } from '../utils/validations.js';
import { validateLeave } from '../utils/validateLeave.js';
import { isDateInPast } from '../utils/isDateInPast.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)


export const createAdmin=async(req,res)=>{
    try{
        const {name,email,password}=req.body;

        if(!name || !email || !password) return res.json({error:`All credentials are necassary`})

        // Check if it is a valid email or not
        if(!isValidEmail(email)) return res.status(400).json({error:"Please enter valid email address"})

        // Checks whether password is Empty
        if(passwordValidation(password)) return res.status(400).json({error:`Password cannot be empty`})

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
                
            
    }catch(e){
        return res.json({error:e.message})
    }
}

export const adminSignin=async(req,res)=>{
    try{
        const {email,password,role}=req.body;
        if(!email || !password || !role) return res.status(400).json({message:`All fields are necassary`})

        // Check if it is a valid email or not
        if(!isValidEmail(email)) return res.status(400).json({error:"Please enter valid email address"})

        // Checks whether password is Empty
        if(passwordValidation(password)) return res.status(400).json({error:`Password cannot be empty`})

        // If the user is admin
            if(role === "admin"){
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
                 
            }
            else{
                return res.json({error:`Invalid credentials`})
            }
        
    }catch(e){
       return res.json({error:e.message})
    }
}

export const applyForLeave=async(req,res)=>{
    try{
        const {id}=req.auth;
        const {date,reason}=req.body;

        if(!date || !reason) return res.status(400).json({error:"Both date and reason fields are mandatory"})
        
        // Getting the leave id from id.json file
        let leaveId=await generateId("leave");
        
        const data=await fs.readFile(`${__dirname}/../../db/admin.json`,'utf8')
        const fileData=JSON.parse(data);
        const updatedFileData=fileData.admins.map((admin)=>{
            if(admin.adminId == id){
                if(admin.leavesLeft <= 0){
                    return res.status(400).json({message:"You have exhausted all your leaves"})
                }
            //    Logic for whether the leave is valid or not
                
                    validateLeave(date);
                    admin.leaves.push({date,reason,leaveId});
                    admin.leavesLeft--;
                
            }
            return admin;
        })
        const newFileData=JSON.stringify({admins:updatedFileData})

        await fs.writeFile(`${__dirname}/../../db/admin.json`,newFileData,'utf8')
        return res.status(201).json({message:`Leave created successfully`})
        
    }catch(e){
        res.json({error:e.message})
    }
}

// Lists all leaves of an admin who is currently logged in
export const listAllLeaves=async (req,res)=>{
    try{
        const adminId=req.auth.id
        const data=await fs.readFile(`${__dirname}/../../db/admin.json`,'utf8')
        const fileData=JSON.parse(data);
        const admin=fileData.admins.filter((admin)=>{
            if(admin.adminId === adminId) {
                return admin;
            }
        })
        return res.json({leaves:admin[0].leaves})
    }catch(e){
        return res.status(500).json({error:e.message})
    }

}

// It is used to modify the leaves of an admin
export const updateLeave=async(req,res)=>{
    try{
        const {date,reason}=req.body;
        const adminId=req.auth.id;
        const leaveId=Number(req.params.leaveId);        
        const data=await fs.readFile(`${__dirname}/../../db/admin.json`,'utf8')
        const fileData=JSON.parse(data);
        const updatedEmployee= fileData.admins.map((admin)=>{
            if(admin.adminId == adminId){
                let leave=admin.leaves.map((leave)=>{
                    if(leave.leaveId === leaveId){
                        // upate leave here
                        if(date){
                           validateLeave(date)
                           isDateInPast(leave.date)
                           leave.date=date
                        }
                        if(reason) leave.reason=reason
                    }
                    return leave
                })
                    admin.leaves=leave;
            }
            return admin;
        })

        const newUpdatedFile=JSON.stringify({admins:updatedEmployee})
        await fs.writeFile(`${__dirname}/../../db/admin.json`,newUpdatedFile,'utf8')
        return res.json({message:'Leave updated successfully'})          

    }catch(e){
        return res.status(500).json({error:e.message})
    }   
}

// It deletes an admin from a JSON Database
export const deleteAdmin=async (req,res)=>{
    try{
        const adminId=req.params.adminId
        const data=await fs.readFile(`${__dirname}/../../db/admin.json`,'utf8')
        const fileData=JSON.parse(data);
        
        const updatedAdminList= fileData.admins.filter((admin)=>{
            if(admin.adminId == adminId) return false;
            return admin;
        })
        fileData.admins=updatedAdminList;
        const finalFileData=JSON.stringify(fileData);
        await fs.writeFile(`${__dirname}/../../db/admin.json`,finalFileData,'utf8')
        return res.json({message:"Admin Deleted Successfully"})
        
    }catch(e){
        return res.json({error:e})
    }
}