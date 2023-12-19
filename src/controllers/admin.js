import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import jwt from 'jsonwebtoken'
import 'dotenv/config'

import { generateAuthToken } from '../utils/geneateAuthToken.js';
import { generateId } from '../utils/generateId.js';
import { generateHashedPassword } from '../utils/generateHashedPassword.js';
import { isValidPassword } from '../utils/isValidPassword.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)


export const createAdmin=async(req,res)=>{
    try{
        const {name,email,password}=req.body;

        if(!name || !email || !password) return res.json({error:`All credentials are necassary`})

        // gnereate admin id 
        let adminId= await generateId("admin");

        // Hashing the password
        const hashedPassword=generateHashedPassword(password);

        const data=await fs.readFile(`${__dirname}/../../db/admin.json`,'utf8')
        const fileData=JSON.parse(data);
        const newAdmin={adminId,name,email,hashedPassword,role:"admin"};

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
        if(!email || !password || !role) res.status(400).json({message:`All fields are necassary`})
        // If the user is admin
            if(role === "admin"){
                const data=await fs.readFile(`${__dirname}/../../db/admin.json`,'utf8')
                const fileData=JSON.parse(data);
                const admin=fileData.admins.filter((admin)=>{
                        if(admin.email === email && isValidPassword(password,admin.hashedPassword)) return true;
                    })
                    console.log(`here is the admin: `,admin)
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