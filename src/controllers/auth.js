import fs from 'fs'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export const signin=async(req,res)=>{
    try{
        const {email,password,role}=req.body;
            if(role === "superadmin"){
                fs.readFile(`${__dirname}/../../db/superadmin.json`,'utf8',(error,data)=>{
                    if(error) return res.status(500).json({error:"Internal Server Error"})
                    const fileData=JSON.parse(data);
                    if(email === fileData.superadmin.email && password == fileData.superadmin.password){
                        const token=jwt.sign({id:fileData.superadmin.id,email:fileData.superadmin.email},process.env.JWT_SECRET_KEY);
                        return res.json({
                            token
                        })
                    }
                 })
            }
        
    }catch(e){
       return res.json({error:e})
    }
}