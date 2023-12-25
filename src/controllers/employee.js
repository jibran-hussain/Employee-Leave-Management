import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config'
import { generateId } from '../utils/generateId.js';
import { isDateInPast } from '../utils/isDateInPast.js';
import { getDatesArray } from '../utils/getDatesArray.js';
import { isValidDate } from '../utils/isValidDate.js';
import { getDate } from '../utils/getDate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

// It is used to apply leave for employee
export const applyForLeave=async (req,res)=>{
    try{
        const {id}=req.auth;
        let {fromDate,toDate,reason}=req.body;

        if(!fromDate || !toDate || !reason) return res.json({error:'All fields are necassary'})

        fromDate=getDate(fromDate);
        toDate=getDate(toDate);
        
        if(isValidDate(fromDate) || isValidDate(toDate)) return res.json({error:'Please enter valid date'})

        isDateInPast(fromDate)
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
       return res.json({error:e.message})
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
        return res.json({leaves:employee[0].leaveDetails})
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
                        leave.dates=[...newDates,...addedLeaveDays.dates];
                        if(reason) leave.reason=reason

                    }
                    return leave
                })
                employee.leaveDetails=leave;
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
                            console.log(date)
                            if(getDate(date).getTime() < new Date().getTime()) return true;
                            return false;
                        })
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

// It deletes an employee from a JSON Database.This can be only done by admin or superadmin
export const deleteEmployee=async (req,res)=>{
    try{
        const employeeId=Number(req.params.employeeId)
        const data=await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        
        const updatedEmployeesList= fileData.employees.filter((employee)=>{
            if(employee.employeeId === employeeId) return false;
            return employee;
        })
        fileData.employees=updatedEmployeesList;
        const finalFileData=JSON.stringify(fileData);
        await fs.writeFile(`${__dirname}/../../db/employee.json`,finalFileData,'utf8')
        return res.json({message:"Employee Deleted Successfully"})
        
    }catch(e){
        return res.json({error:e.message})
    }
}

// List all leaves of a specific user. This can be only done by admin and superadmin
export const getAllLeavesofEmployee=async (req,res)=>{
    try{
        const employeeId=Number(req.params.employeeId)
        const data=await fs.readFile(`${__dirname}/../../db/employee.json`,'utf8')
        const fileData=JSON.parse(data);
        const employee=fileData.employees.filter((employee)=>{
            if(employee.employeeId === employeeId) {
                return employee;
            }
        })
        if(employee.length === 0) return res.status(400).json({error:'Employee with this id does not exist'})
        return res.json({leaves:employee[0].leaveDetails})
    }catch(e){
        console.log(e)
        return res.status(500).json({message:`Internal Server Error`})
    }

}