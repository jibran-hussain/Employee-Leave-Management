import fs from 'fs'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import jwt from 'jsonwebtoken'
import 'dotenv/config'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export const SuperadminSignin=async(req,res)=>{
    try{
        const {email,password,role}=req.body;
        if(!email || !password || !role) res.status(400).json({message:`All fields are necassary`})
        // If the user is superadmin
            if(role === "superadmin"){
                fs.readFile(`${__dirname}/../../db/superadmin.json`,'utf8',(error,data)=>{
                    if(error) return res.status(500).json({error:"Internal Server Error"})
                    const fileData=JSON.parse(data);
                    if(email === fileData.superadmin.email && password == fileData.superadmin.password){
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
                 })
            }
        
    }catch(e){
       return res.json({error:e})
    }
}