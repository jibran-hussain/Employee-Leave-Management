import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import 'dotenv/config'
import { generateAuthToken } from '../utils/geneateAuthToken.js';
import { generateId } from '../utils/generateId.js';
import { validateLeave } from '../utils/validateLeave.js';
import { generateHashedPassword } from '../utils/generateHashedPassword.js';
import {isValidPassword} from '../utils/isValidPassword.js'
import { isValidEmail,passwordValidation } from '../utils/validations.js';
import { isDateInPast } from '../utils/isDateInPast.js';
import { getDatesArray } from '../utils/getDatesArray.js';
import { isValidDate } from '../utils/isValidDate.js';
import { getDate } from '../utils/getDate.js';
import { isDate } from 'util/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

// Creates an Employee
export const createEmployee=async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        if(!name ||!email || !password) return res.json({message:'All fields are mandatory'})

        // Check if it is a valid email or not
        if(!isValidEmail(email)) return res.status(400).json({error:"Please enter valid email address"})

        // Checks whether password is Empty
        if(passwordValidation(password)) return res.status(400).json({error:`Password cannot be empty and should have more than 3 characters`})

        // Fetching the file and adding new employees
        const data= await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);

        // Check whether employee of this email-id already exists or not
        const isExisting=fileData.employees.some((employee)=>employee.email === email);
        if(isExisting) return res.status(500).json({error:"Employee with this email already exists. Please try with another email id"})

        // Get the employeeId for the new employee
        let employeeId=await generateId("employee");

        // Hashing the password
        const hashedPassword=generateHashedPassword(password);
        
        const newEmployee={employeeId,name,email,hashedPassword,role:"employee",leavesLeft:20,leaveDetails:[],createdBy:req.auth.id};
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

        // Check if it is a valid email or not
        if(!isValidEmail(email)) return res.status(400).json({error:"Please enter valid email address"})

        // Checks whether password is Empty
        if(passwordValidation(password)) return res.status(400).json({error:`Password cannot be empty`})

        if(role === "employee"){
        const data= await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        const employee=fileData.employees.filter((employee)=>{
             if(employee.email === email && isValidPassword(password,employee.hashedPassword)) return true;
              })
         if(employee.length > 0){
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
        console.log(e)
       return res.json({error:e.message})
    }
}


// It deletes an employee from a JSON Database
export const deleteEmployee=async (req,res)=>{
    try{
        const employeeId=req.params.employeeId
        const data=await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        
        const updatedEmployeesList= fileData.employees.filter((employee)=>{
            if(employee.employeeId == employeeId) return false;
            return employee;
        })
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
        const {id}=req.auth;
        let {fromDate,toDate,reason}=req.body;
        fromDate=getDate(fromDate);
        toDate=getDate(toDate);
        
        if(isValidDate(fromDate) || isValidDate(toDate)) return res.json({error:'Please enter valid date'})

        isDateInPast(toDate)

        
        // Getting the leave id from id.json file
        let leaveId=await generateId("leave");
        
        const data=await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        const updatedFileData=fileData.employees.map((employee)=>{
            if(employee.employeeId == id){

                if(employee.leavesLeft <= 0){
                    return res.status(400).json({message:"You have exhausted all your leaves"})
                }
                const {dates,leaveDuration}=getDatesArray(fromDate,toDate);
                employee.leaveDetails.push({leaveId,reason,dates})
                employee.leavesLeft=employee.leavesLeft-leaveDuration;
                
            }
            return employee;
        })
        const newFileData=JSON.stringify({employees:updatedFileData})

        await fs.writeFile(`${__dirname}/../../db/employee.json`,newFileData,'utf8')
        return res.status(201).json({message:`Leave created successfully`})
        
    }catch(e){
        res.json({error:e.message})
    }
}


// Lists all leaves of an employee who is currently logged in
export const listAllLeaves=async (req,res)=>{
    try{
        const employeeId=req.auth.id
        const data=await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        const employee=fileData.employees.filter((employee)=>{
            if(employee.employeeId === employeeId) {
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
        let {fromDate,toDate,reason}=req.body;
        if(!fromDate|| !toDate) return res.status(400).json({error:'Start date and End date is mandatory'});
        fromDate=getDate(fromDate);
        toDate=getDate(toDate);

        isDateInPast(toDate)

        const employeeId=req.auth.id;
        const leaveId=Number(req.params.leaveId);        
        const data=await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        const updatedEmployee= fileData.employees.map((employee)=>{
            if(employee.employeeId == employeeId){
                let leave=employee.leaveDetails.map((leave)=>{
                    if(leave.leaveId === leaveId){
                        if(new Date() > getDate(leave.dates[leave.dates.length-1])) throw new Error('You cannot update this leave')
                        // upate leave here
                       const newDates= leave.dates.filter((date)=>{
                            if(getDate(date) < new Date().toUTCString) return true;
                            return false;
                        })
                        const addedLeaveDays=getDatesArray(fromDate,toDate);
                        console.log(addedLeaveDays,'yehi hai bhaiiiiiiiiiiiiiii')
                        leave.dates=[...newDates,...addedLeaveDays.dates];
                        if(reason) leave.reason=reason

                    }
                    return leave
                })
            }
            return employee;
        })

        const newUpdatedFile=JSON.stringify({employees:updatedEmployee})
        await fs.writeFile(`${__dirname}/../../db/employee.json`,newUpdatedFile,'utf8')
        return res.json({message:'Leave updated successfully'})          

    }catch(e){
        console.log(e)
        return res.status(500).json({error:e.message})
    }   
}


// It is used to delete a specific leave of an employee
export const deleteLeave=async(req,res)=>{
    try{
        const employeeId=req.auth.id;
        const leaveId=Number(req.params.leaveId);
        
        const data=await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        const updatedEmployee= fileData.employees.map((employee)=>{
            if(employee.employeeId == employeeId){
                let leave=employee.leaveDetails.filter((leave)=>{
                    if(leave.leaveId === leaveId){
                        const newDates=leave.dates.filter((date)=>{
                            if(getDate(date).getTime() < new Date().getTime()) return true;
                            return false;
                        })
                        console.log('here are the new dates',newDates)
                        leave.dates=newDates;
                        if(newDates.length == 0) return false;
                        
                    }
                    return leave
                })
                employee.leaveDetails=leave
                employee.leavesLeft++;
                return employee;
            }
            return employee;
        })
        const newUpdatedFile=JSON.stringify({employees:updatedEmployee})
        await fs.writeFile(`${__dirname}/../../db/employee.json`,newUpdatedFile,'utf8')
        return res.json({message:' Leave deleted successfully'})

    }catch(e){
        return res.status(500).json({error:e.message})
    }
}
