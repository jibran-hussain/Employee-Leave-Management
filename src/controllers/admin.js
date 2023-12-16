import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import jwt from 'jsonwebtoken'
import 'dotenv/config'

import { generateAuthToken } from '../utils/geneateAuthToken.js';
import { generateId } from '../utils/generateId.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)


export const createAdmin=async(req,res)=>{
    try{
        const {name,email,password}=req.body;

        if(!name || !email || !password) return res.json({error:`All credentials are necassary`})

        // gnereate admin id 
        let adminId= await generateId("admin");

        const data=await fs.readFile(`${__dirname}/../../db/admin.json`,'utf8')
        const fileData=JSON.parse(data);
        const newAdmin={adminId,...req.body,role:"admin"};
        console.log(fileData,"ollllllllllld")

        fileData.admins.push(newAdmin);
        console.log(fileData,"neeeeeeeeeeew")
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
                        if(admin.email === email && admin.password === password) return true;
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
       return res.json({error:e})
    }
}