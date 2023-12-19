import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import 'dotenv/config'
import { generateAuthToken } from '../utils/geneateAuthToken.js';
import { generateId } from '../utils/generateId.js';
import { validateLeave } from '../utils/validateLeave.js';
import { generateHashedPassword } from '../utils/generateHashedPassword.js';
import {isValidPassword} from '../utils/isValidPassword.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

// Creates an Employee
export const createEmployee=async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        if(!name ||!email || !password) return res.json({message:'All fields are mandatory'})

        // Get the employeeId for the new employee
        let employeeId=await generateId("employee");

        // Hashing the password
        const hashedPassword=generateHashedPassword(password);
            
        // Fetching the file and adding new employees
        const data= await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        const newEmployee={employeeId,name,email,hashedPassword,role:"employee",leavesLeft:20,leaves:[]};
        fileData.employees.push(newEmployee);
        const newFileData=JSON.stringify(fileData)

        // Saving the new employee in JSON database
        await fs.writeFile(`${__dirname}/../../db/employee.json`,newFileData,'utf8')
        const token=generateAuthToken(employeeId,email,"employee")
        res.cookie('jwt',token,{
              httpOnly:true
             })
        return res.json({message:`Employee created successfully`});
                
            
    }catch(e){
        return res.json({error:e.message})
    }
}


// Gets called when employee logins
export const employeeSingin=async(req,res)=>{
    try{
        const {email,password,role}=req.body;
        if(!email || !password || !role) return res.status(400).json({message:`All fields are necassary`})
        if(role === "employee"){
        const data= await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        const employee=fileData.employees.filter((employee)=>{
             if(employee.email === email && isValidPassword(password,employee.hashedPassword)) return true;
              })
         if(employee){
                 const token=generateAuthToken(employee[0].employeeId,employee[0].email,role)
                 res.cookie('jwt',token,{
                       httpOnly:true
                    })
                 return res.json({
                         token
                    })
          }else{
                return res.status(400).json({message:`Invalid credentials`})
            }
                 
        }else{
                return res.json({error:`Invalid credentials`})
            }
        
    }catch(e){
       return res.json({error:e})
    }
}


// It deletes an employee from a JSON Database
export const deleteEmployee=async (req,res)=>{
    try{
        const employeeId=req.params.employeeId;
        // if(req.auth.id != employeeId) return res.status(403).json({error:'Unauthorized (Access denied)'});
        const data=await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        const updatedEmployeesList= fileData.employees.filter((employee)=>{
            if(employee.employeeId == employeeId) return false;
            return employee;
        })
        console.log(updatedEmployeesList,"ddddddddddddddddddddd")
        fileData.employees=updatedEmployeesList;
        const finalFileData=JSON.stringify(fileData);
        await fs.writeFile(`${__dirname}/../../db/employee.json`,finalFileData,'utf8')
        return res.json({message:"Employee Deleted Successfully"})
        
    }catch(e){
        return res.json({error:e})
    }
}

// It is used to apply for leave
export const applyForLeave=async (req,res)=>{
    try{
        const {id}=req.auth;  //we can also get the id from route params, i think that will be the better option
        const {date,reason}=req.body;
        
        // Getting the leave id from id.json file
        let leaveId=await generateId("leave");
        
        const data=await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        const updatedFileData=fileData.employees.map((employee)=>{
            console.log(id,"here it is")
            if(employee.employeeId == id){
                if(employee.leavesLeft <= 0){
                    return res.status(400).json({message:"You have exhausted all your leaves"})
                }
            //    Logic for whether the leave is valid or not
                try{
                    validateLeave(date);
                    employee.leaves.push({...req.body,leaveId});
                    employee.leavesLeft--;
                }catch(error){
                    return res.status(400).json({ error: error.message });
                }
            }
            return employee;
        })
        console.log(updatedFileData,"Its updated file data")
        const newFileData=JSON.stringify({employees:updatedFileData})

        await fs.writeFile(`${__dirname}/../../db/employee.json`,newFileData,'utf8')
        return res.status(201).json({message:`Leave created successfully`})
        
    }catch(e){
        return res.json({error:e})
    }
}


// Lists all leaves of an employee who is currently logged in
export const listAllLeaves=async (req,res)=>{
    try{
        const employeeId=Number(req.params.employeeId)
        if(req.auth.id != employeeId) return res.status(403).json({error:"Access denied"})
        const data=await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        const employee=fileData.employees.filter((employee)=>{
            if(employee.employeeId === employeeId) {
                console.log(typeof employee.employeeId)
                return employee;
            }
        })
        return res.json({leaves:employee[0].leaves})
    }catch(e){
        return res.status(500).json({message:`Internal Server Error`})
    }

}


// It is used to modify the leaves of an employee
export const updateLeaves=async(req,res)=>{
    try{
        const {date,reason}=req.body;
        const employeeId=Number(req.params.employeeId);
        const leaveId=Number(req.params.leaveId);
        if(req.auth.id != employeeId) return res.status(403).json({error:'Access denied'});
        
        const data=await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        const updatedEmployee= fileData.employees.map((employee)=>{
            if(employee.employeeId == employeeId){
                let leave=employee.leaves.map((leave)=>{
                    if(leave.leaveId === leaveId){
                        // upate leave here
                        if(date) leave.date=date
                        if(reason) leave.reason=reason
                    }
                    return leave
                })
                    employee.leaves=leave;
            }
            return employee;
        })

        const newUpdatedFile=JSON.stringify({employees:updatedEmployee})
        await fs.writeFile(`${__dirname}/../../db/employee.json`,newUpdatedFile,'utf8')
        return res.json({message:'Employee updated successfully'})          

    }catch(e){
        return res.status(500).json({error:'Internal Server Error'})
    }   
}


// It is used to delete a specific leave of an employee
export const deleteLeave=async(req,res)=>{
    try{
        const employeeId=Number(req.params.employeeId);
        const leaveId=Number(req.params.leaveId);
        if(req.auth.id != employeeId) return res.status(403).json({error:'Access denied'});
        
        const data=await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        const updatedEmployee= fileData.employees.map((employee)=>{
            if(employee.employeeId == employeeId){
                    let leave=employee.leaves.map((leave)=>{
                        if(leave.leaveId === leaveId) return false;
                        return leave
                    })
                    employee.leaves=leave;
            }
            return employee;
        })

        const newUpdatedFile=JSON.stringify({employees:updatedEmployee})
        await fs.writeFile(`${__dirname}/../../db/employee.json`,newUpdatedFile,'utf8')
        return res.json({message:' Leave deleted successfully'})

    }catch(e){
        return res.status(500).json({error:e})
    }
}
