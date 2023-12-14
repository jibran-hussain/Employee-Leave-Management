import fs from 'fs'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import jwt from 'jsonwebtoken'
import 'dotenv/config'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)


export const createEmployee=async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password) return res.json({message:'All fields are mandatory'})
        
            fs.readFile(`${__dirname}/../../db/employee.json`,'utf8',(error,data)=>{
                if(error) return res.status(500).json({error:"Internal Server Error"})
                const fileData=JSON.parse(data);
                const newEmployee={employeeId:3,...req.body,role:"admin"};
                fileData.employees.push(newEmployee);
                const newFileData=JSON.stringify(fileData)
                fs.writeFile(`${__dirname}/../../db/employee.json`,newFileData,'utf8',(error)=>{
                    if(error) return res.status(500).json({message:`Internal Server Error`})
                    return res.json({message:`Employee created successfully`});
                })
            })
    }catch(e){
        return res.json({error:e.message})
    }
}

export const employeeSingin=async(req,res)=>{
    try{
        const {email,password,role}=req.body;
        if(!email || !password || !role) res.status(400).json({message:`All fields are necassary`})
            if(role === "employee"){
                fs.readFile(`${__dirname}/../../db/employee.json`,'utf8',(error,data)=>{
                    if(error) return res.status(500).json({error:"Internal Server Error"})
                    const fileData=JSON.parse(data);
                console.log(fileData)
                    const employee=fileData.employees.filter((employee)=>{
                        if(employee.email === email && employee.password === password) return true;
                    })
                    console.log(employee,`here is the admin`)
                    if(employee){
                        const token=jwt.sign({id:employee[0].employeeId,email:employee[0].email,role:"employee"},process.env.JWT_SECRET_KEY);
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