import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import bcrypt from 'bcrypt'
import {isValidPassword} from '../utils/isValidPassword.js'
import { isValidEmail , passwordValidation} from '../utils/validations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export const superadminSignin=async(req,res)=>{
    try{
        const {email,password,role}=req.body;
        if(!email || !password || !role) return res.status(400).json({message:`All fields are necassary`})

        // Check if it is a valid email or not
        if(!isValidEmail(email)) return res.status(400).json({error:"Please enter valid email address"})

        // Checks whether password is Empty
        if(passwordValidation(password)) return res.status(400).json({error:`Password cannot be empty`})

        // If the user is superadmin
            if(role === "superadmin"){
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
        
    }catch(e){
       return res.json({error:e})
    }
}