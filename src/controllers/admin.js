import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import jwt from 'jsonwebtoken'
import 'dotenv/config'

import { generateId } from '../utils/generateId.js';
import { isDateInPast } from '../utils/isDateInPast.js';
import { getDatesArray } from '../utils/getDatesArray.js';
import { getDate } from '../utils/getDate.js';
import { isValidDate } from '../utils/isValidDate.js';
import { runInNewContext } from 'vm';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)


// It deletes an admin from a JSON Database
export const deleteAdmin=async (req,res)=>{
    try{
        const userId=Number(req.params.adminId)
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        
        const updatedUsersList= fileData.users.filter((user)=>{
            if(user.id == userId) return false;
            return user;
        })
        fileData.users=updatedUsersList;
        const finalFileData=JSON.stringify(fileData);
        await fs.writeFile(`${__dirname}/../../db/users.json`,finalFileData,'utf8')
        return res.json({message:"Admin Deleted Successfully"})
        
    }catch(e){
        return res.json({error:e.message})
    }
}

export const deleteLeave=async(req,res)=>{
    try{
        const userId=req.auth.id;
        const leaveId=Number(req.params.leaveId);
        
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        let leaveExists=false;
        const updatedUsers= fileData.users.map((user)=>{
            if(user.id == userId){
                let leave=user.leaveDetails.filter((leave)=>{
                    if(leave.leaveId === leaveId){
                        leaveExists=true;
                        const newDates=leave.dates.filter((date)=>{
                            if(getDate(date).getTime() < new Date().getTime()) return true;
                            return false;
                        })
                        leave.dates=newDates;
                        if(newDates.length == 0) return false;
                        
                    }
                    return leave
                })
                user.leaveDetails=leave
                user.leavesLeft++;
                return user;
            }
            return user;
        })
        if(!leaveExists) return res.status(400).json({error:'This leave id does not belong to this user'})
        const newUpdatedFile=JSON.stringify({users:updatedUsers})
        await fs.writeFile(`${__dirname}/../../db/users.json`,newUpdatedFile,'utf8')
        return res.json({message:' Leave deleted successfully'})

    }catch(e){
        console.log(e)
        return res.status(500).json({error:e.message})
    }
}

export const listAllAdmins=async(req,res)=>{
    try{
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);
        const admins=fileData.users.filter((user)=>{
            if(user.role === 'admin'){
                user.hashedPassword=undefined;
                return true;
            }
            return false;
        })
        return res.json({admins})
    }catch{
        return res.status(500).json({message:`Internal Server Error`})
    }
}
