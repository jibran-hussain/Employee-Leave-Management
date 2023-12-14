import fs from 'fs'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import jwt from 'jsonwebtoken'
import 'dotenv/config'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)


export const createAdmin=async(req,res)=>{
    try{
        const {email,password}=req.body;
            fs.readFile(`${__dirname}/../../db/admin.json`,'utf8',(error,data)=>{
                if(error) return res.status(500).json({error:"Internal Server Error"})
                const fileData=JSON.parse(data);
                const newAdmin={adminId:3,...req.body,role:"admin"};
                fileData.admins.push(newAdmin);
                const newFileData=JSON.stringify(fileData)
                fs.writeFile(`${__dirname}/../../db/admin.json`,newFileData,'utf8',(error)=>{
                    if(error) return res.status(500).json({message:`Internal Server Error`})
                    return res.json({message:`Admin created successfully`});
                })
            })
    }catch(e){
        return res.json({error:e.message})
    }
}

export const adminSignin=async(req,res)=>{
    try{
        const {email,password,role}=req.body;
        if(!email || !password || !role) res.status(400).json({message:`All fields are necassary`})
        // If the user is superadmin
            if(role === "admin"){
                fs.readFile(`${__dirname}/../../db/admin.json`,'utf8',(error,data)=>{
                    if(error) return res.status(500).json({error:"Internal Server Error"})
                    const fileData=JSON.parse(data);
                console.log(fileData)
                    const admin=fileData.admins.filter((admin)=>{
                        if(admin.email === email && admin.password === password) return true;
                    })
                    console.log(admin,`here is the admin`)
                    if(admin){
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
                 })
            }
            else{
                return res.json({error:`Invalid credentials`})
            }
        
    }catch(e){
       return res.json({error:e})
    }
}