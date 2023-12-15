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

        let employeeId;
        // Get the employeeId for the new employee
            fs.readFile(`${__dirname}/../../db/id.json`,'utf8',(error,data)=>{
                if(error) return res.json({error:"Internal Server Error"});
                const idFileData=JSON.parse(data);
                console.log(idFileData,"here is the")
                employeeId=idFileData.newEmployeeId;
                idFileData.newEmployeeId++;
                const updatedIdFileData=JSON.stringify(idFileData)
                // Updating the increment in the id file
                fs.writeFile(`${__dirname}/../../db/id.json`,updatedIdFileData,'utf8',(error)=>{
                    if(error) return res.json({error: `Internal Server Error`})
                });
            })
        
            fs.readFile(`${__dirname}/../../db/employee.json`,'utf8',(error,data)=>{
                if(error) return res.status(500).json({error:"Internal Server Error"})
                const fileData=JSON.parse(data);
                console.log(fileData,"FILEDATA")
                const newEmployee={employeeId,...req.body,role:"employee",leavesLeft:20,leaves:[]};
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

export const applyForLeave=async (req,res)=>{
    try{
        const {id}=req.auth;  //we can also get the id from route params, i think that will be the better option

        let leaveId;
        // Getting the leave id from id.json file
        fs.readFile(`${__dirname}/../../db/id.json`,'utf8',(error,data)=>{
            if(error) return res.json({error:"Internal Server Error"});
            const idFileData=JSON.parse(data);
            console.log(idFileData,"here is the")
            leaveId=idFileData.employeeLeaveId;
            idFileData.employeeLeaveId++;
            const updatedIdFileData=JSON.stringify(idFileData)
            // Updating the increment in the id file
            fs.writeFile(`${__dirname}/../../db/id.json`,updatedIdFileData,'utf8',(error)=>{
                if(error) return res.json({error: `Internal Server Error`})
            });
        })


        fs.readFile(`${__dirname}/../../db/employee.json`,'utf8',(error,data)=>{
            if(error) return res.status(500).json({error:`Internal Server Error`})
            const fileData=JSON.parse(data);
            const updatedFileData=fileData.employees.map((employee)=>{
                if(employee.employeeId == id){
                   if(employee.leavesLeft <= 0){
                        return res.status(400).json({message:"You have exhausted all your leaves"})
                   }
                        employee.leaves.push({...req.body,leaveId});
                        employee.leavesLeft--;
                }
                return employee;
            })
            console.log(updatedFileData,"here is updated file data")
            const newFileData=JSON.stringify({employees:updatedFileData})

            fs.writeFile(`${__dirname}/../../db/employee.json`,newFileData,'utf8',(error)=>{
                if(error) return res.status(500).json({error:`Internal Server Error`})
                return res.status(201).json({message:`Leave created successfully`})
            })
        })
    }catch(e){
        return res.json({error:e})
    }
}

export const listAllLeaves=async (req,res)=>{
    try{
        const employeeId=Number(req.params.employeeId)
        console.log(typeof employeeId)
        if(req.auth.id != employeeId) return res.status(403).json({error:"Access denied"})
        fs.readFile(`${__dirname}/../../db/employee.json`,'utf8',(error,data)=>{
            if(error) return res.status(500).json({error: `Internal Server Error`});
            const fileData=JSON.parse(data);
            const employee=fileData.employees.filter((employee)=>{
                if(employee.employeeId === employeeId) {
                    console.log(typeof employee.employeeId)
                    return employee;
                }
            })
            console.log(employee)
            return res.json({leaves:employee[0].leaves})
        })
    }catch(e){
        return res.status(500).json({message:`Internal Server Error`})
    }

}

export const updateLeaves=async(req,res)=>{
    try{
        const employeeId=Number(req.params.employeeId);
        const leaveId=Number(req.params.leaveId);
        if(req.auth.id != employeeId) return res.status(403).json({error:'Access denied'});
        
        fs.readFile(`${__dirname}/../../db/employee.json`,'utf8',(error,data)=>{
            if(error) return res.status(500).json({error:'Internal Server Error'});
            const fileData=JSON.parse(data);
            const updatedEmployee= fileData.employees.map((employee)=>{
                if(employee.employeeId == employeeId){
                        let leave=employee.leaves.map((leave)=>{
                            if(leave.leaveId === leaveId){
                                // upate leave here
                                leave.date="01-01-2023"
                            }
                            return leave
                        })
                        employee.leaves=leave;
                }
                return employee;
            })

            const newUpdatedFile=JSON.stringify({employees:updatedEmployee})
            console.log(updatedEmployee)
            fs.writeFile(`${__dirname}/../../db/employee.json`,newUpdatedFile,'utf8',(error)=>{
                if(error) return res.json({error:'Internal Server Error'});
                return res.json({message:'Employee updated successfully'})
            })            
        })

    }catch(e){
        return res.status(500).json({error:'Internal Server error'})
    }   
}
