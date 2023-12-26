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

// Lists all leaves of an employee who is currently logged in
export const listAllEmployeeLeaves=async (req,res)=>{
    try{
        let employeeId;
        if(req.auth.role === 'employee') employeeId=req.auth.id;
        else if(req.auth.role === 'admin' || req.auth.role === 'superadmin') employeeId=Number(req.params.employeeId)
        else return res.json({error: 'Unauthorized'})
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        const user=fileData.users.filter((user)=>{
            if(user.id === employeeId && user.role === 'employee') {
                return user;
            }
        })
        if(user.length == 0) return res.status(400).json({error:'No employee with this id exists'})
        return res.json({leaves:user[0].leaveDetails})
    }catch(e){
        return res.status(500).json({message:`Internal Server Error`})
    }

}

// It deletes an employee from a JSON Database.This can be only done by admin or superadmin
export const deleteEmployee=async (req,res)=>{
    try{
        const userId=Number(req.params.employeeId)
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        
        let isEmployeeExisting=false;
        const updatedUsersList= fileData.users.filter((user)=>{
            if(user.id === userId && user.role === 'employee'){
                isEmployeeExisting=true;
                return false;
            };
            return user;
        })
        
        if(!isEmployeeExisting) return res.json({error: "Employee with this id does not exists"})

        fileData.users=updatedUsersList;
        const finalFileData=JSON.stringify(fileData);
        await fs.writeFile(`${__dirname}/../../db/users.json`,finalFileData,'utf8')
        return res.json({message:"Employee Deleted Successfully"})
        
    }catch(e){
        return res.json({error:e.message})
    }
}

export const listAllEmployees=async(req,res)=>{
    try{
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);
        
        const employees=fileData.users.filter((user)=>{
            if(user.role === 'employee'){
                user.hashedPassword=undefined;
                return user;
            }
            return false;
        })

        return res.json({employees})
    }catch{
        return res.status(500).json({message:`Internal Server Error`})
    }
}