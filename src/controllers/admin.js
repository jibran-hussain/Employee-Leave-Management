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


export const applyForLeave=async (req,res)=>{
    try{
        const {id}=req.auth;
        let {fromDate,toDate,reason}=req.body;

        if(!fromDate || !toDate || !reason) return res.json({error:`All fields are necassary`})

        fromDate=getDate(fromDate);
        toDate=getDate(toDate);
        
        if(isValidDate(fromDate) || isValidDate(toDate)) return res.json({error:'Please enter valid date'})

        isDateInPast(toDate)

        
        // Getting the leave id from id.json file
        let leaveId=await generateId("leave");
        
        const data=await fs.readFile(`${__dirname}/../../db/admin.json`,'utf8')
        const fileData=JSON.parse(data);
        const updatedFileData=fileData.admins.map((admin)=>{
            if(admin.adminId == id){

                if(admin.leavesLeft <= 0){
                    return res.status(400).json({message:"You have exhausted all your leaves"})
                }
                const {dates,leaveDuration}=getDatesArray(fromDate,toDate);
                admin.leaveDetails.push({leaveId,reason,dates})
                admin.leavesLeft=admin.leavesLeft-leaveDuration;
                
            }
            return admin;
        })
        const newFileData=JSON.stringify({admins:updatedFileData})

        await fs.writeFile(`${__dirname}/../../db/admin.json`,newFileData,'utf8')
        return res.status(201).json({message:`Leave created successfully`})
        
    }catch(e){
        console.log(e)
        res.json({error:e.message})
    }
}


// Lists all leaves of an admin who is currently logged in
export const listAllLeaves=async (req,res)=>{
    try{
        let adminId;
        if(req.auth.role === 'admin') adminId=req.auth.id;
        else if(req.auth.role === 'superadmin') adminId=Number(req.params.adminId);
        else return res.status(403).json({error:'Unauthorized'})
        const data=await fs.readFile(`${__dirname}/../../db/admin.json`,'utf8')
        const fileData=JSON.parse(data);
        const admin=fileData.admins.filter((admin)=>{
            if(admin.adminId === adminId) {
                return admin;
            }
        })
        return res.json({leaves:admin[0]?.leaveDetails})
    }catch(e){
        console.log(e)
        return res.status(500).json({message:`Internal Server Error`})
    }

}
// It is used to modify the leaves of an admin
export const updateLeave=async(req,res)=>{
    try{
        let {fromDate,toDate,reason}=req.body;
        if(!fromDate|| !toDate) return res.status(400).json({error:'Start date and End date is mandatory'});
        fromDate=getDate(fromDate);
        toDate=getDate(toDate);

        isDateInPast(toDate)

        const adminId=req.auth.id;
        const leaveId=Number(req.params.leaveId);        
        const data=await fs.readFile(`${__dirname}/../../db/admin.json`,'utf8')
        const fileData=JSON.parse(data);
        const updatedAdmin= fileData.admins.map((admin)=>{
            if(admin.adminId == adminId){
                let leave=admin.leaveDetails.map((leave)=>{
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
            }
            return admin;
        })

        const newUpdatedFile=JSON.stringify({admins:updatedAdmin})
        await fs.writeFile(`${__dirname}/../../db/admin.json`,newUpdatedFile,'utf8')
        return res.json({message:'Leave updated successfully'})          

    }catch(e){
        console.log(e)
        return res.status(500).json({error:e.message})
    }   
}

// It deletes an admin from a JSON Database
export const deleteAdmin=async (req,res)=>{
    try{
        const adminId=Number(req.params.adminId)
        const data=await fs.readFile(`${__dirname}/../../db/admin.json`,'utf8')
        const fileData=JSON.parse(data);
        
        const updatedAdminList= fileData.admins.filter((admin)=>{
            if(admin.adminId == adminId) return false;
            return admin;
        })
        fileData.admins=updatedAdminList;
        const finalFileData=JSON.stringify(fileData);
        await fs.writeFile(`${__dirname}/../../db/admin.json`,finalFileData,'utf8')
        return res.json({message:"Admin Deleted Successfully"})
        
    }catch(e){
        return res.json({error:e})
    }
}

export const deleteLeave=async(req,res)=>{
    try{
        const adminId=req.auth.id;
        const leaveId=Number(req.params.leaveId);
        
        const data=await fs.readFile(`${__dirname}/../../db/admin.json`,'utf8')
        const fileData=JSON.parse(data);
        const updatedAdmin= fileData.admins.map((admin)=>{
            if(admin.adminId == adminId){
                let leave=admin.leaveDetails.filter((leave)=>{
                    if(leave.leaveId === leaveId){
                        const newDates=leave.dates.filter((date)=>{
                            if(getDate(date).getTime() < new Date().getTime()) return true;
                            return false;
                        })
                        leave.dates=newDates;
                        if(newDates.length == 0) return false;
                        
                    }
                    return leave
                })
                admin.leaveDetails=leave
                admin.leavesLeft++;
                return admin;
            }
            return admin;
        })
        const newUpdatedFile=JSON.stringify({employees:updatedAdmin})
        await fs.writeFile(`${__dirname}/../../db/admin.json`,newUpdatedFile,'utf8')
        return res.json({message:' Leave deleted successfully'})

    }catch(e){
        console.log(e)
        return res.status(500).json({error:e.message})
    }
}


