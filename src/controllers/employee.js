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
            if(user.id === employeeId && (user.role === 'employee' || user.role === 'admin')) {
                return user;
            }
        })
        if(user.length == 0) return res.status(400).json({error:'No employee with this id exists'})
        return res.json({leaves:user[0].leaveDetails})
    }catch(e){
        return res.status(500).json({message:`Internal Server Error`})
    }

}

export const listAllEmployees=async(req,res)=>{
    try{
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);
        
        const employees=fileData.users.filter((user)=>{
            if(user.active === false) return false;
            if(user.role === 'employee' || user.role === 'admin'){
                user.hashedPassword=undefined;
                user.active=undefined
                return user;
            }
            return false;
        })

        return res.json({employees})
    }catch{
        return res.status(500).json({message:`Internal Server Error`})
    }
}

export const listAllDisabledEmployees=async (req,res)=>{
    try{
        const data=await fs.readFile('./db/users.json','utf8');
        const fileData=JSON.parse(data);
        const disabedEmployees=fileData.users.filter(user=>{
            if(user.active === false){
                user.hashedPassword=undefined;
                user.active=undefined;
                return true;
            }
            return false;
        });
        return res.json({disabedEmployees})
    }catch(e){
        return res.status(500),json({error:'Internal server error'})
    }
}

// It activates the employee account
export const activateAccount=async (req,res)=>{
    try{

        const userId=Number(req.params.employeeId)
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        
        let userToActivate;
        let updatedUsersList;
        if(req.auth.role === 'superadmin'){
                updatedUsersList= fileData.users.map((user)=>{
                if(user.id === userId){
                    user.active=true;
                    isEmployeeExisting=true;
                };
                return user;
            })
        }else if(req.auth.role === 'admin'){
                updatedUsersList= fileData.users.map((user)=>{
                if(user.id === userId && user.role === 'admin') userToActivate=user;
                if(user.id === userId && user.role === 'employee'){
                    user.active=true;
                    userToActivate=user;
                };
                return user;
            })
        }
        if(!userToActivate) return res.status(400).json({error:'Employee with this id does not exist'})
        if(req.auth.role === 'admin' && userToActivate.role === 'admin') return res.status(500).json({error:`You cannot activate another admins account`})

        fileData.users=updatedUsersList;
        const finalFileData=JSON.stringify(fileData);
        await fs.writeFile(`${__dirname}/../../db/users.json`,finalFileData,'utf8')
        return res.json({message:"Employee account activated Successfully"})
        
    }catch(e){
        return res.json({error:e.message})
    }
}


export const getLoggedUsersDetails=async(req,res)=>{
    try{
        const {id:userId,role}=req.auth;
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);

        const user=fileData.users.filter((user)=>user.id === userId && user.role === role);
        user[0].hashedPassword=undefined;
        user[0].leaveDetails=undefined
        user[0].active=undefined;
        return res.json({user:user[0]})

    }catch(e){
        return res.status(500).json({error:`Internal server error`})
    }
}

// It deletes an employee from a JSON Database.This can be only done by admin or superadmin
export const deleteEmployee=async (req,res)=>{
    try{

        const userId=Number(req.params.employeeId)
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        
        let userToDelete;
        let updatedUsersList;
        if(req.auth.role === 'superadmin'){
                updatedUsersList= fileData.users.map((user)=>{
                if(user.id === userId){
                    user.active=false;
                    isEmployeeExisting=true;
                };
                return user;
            })
        }else if(req.auth.role === 'admin'){
                updatedUsersList= fileData.users.map((user)=>{
                if(user.id === userId && user.role === 'admin') userToDelete=user;
                if(user.id === userId && user.role === 'employee'){
                    user.active=false;
                    userToDelete=user;
                };
                return user;
            })
        }
        console.log(userToDelete)
        if(!userToDelete) return res.status(400).json({error:'Employee with this id does not exist'})
        if(req.auth.role === 'admin' && userToDelete.role === 'admin') return res.status(500).json({error:`You cannot delete another admins`})

        fileData.users=updatedUsersList;
        const finalFileData=JSON.stringify(fileData);
        await fs.writeFile(`${__dirname}/../../db/users.json`,finalFileData,'utf8')
        return res.json({message:"Employee Deleted Successfully"})
        
    }catch(e){
        return res.json({error:e.message})
    }
}