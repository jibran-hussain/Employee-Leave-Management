import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config'

import { generateId } from '../utils/generateId.js';
import { isDateInPast } from '../utils/isDateInPast.js';
import { getDatesArray } from '../utils/getDatesArray.js';
import { getDate } from '../utils/getDate.js';
import { isValidDate } from '../utils/isValidDate.js';


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
        
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        const updatedFileData=fileData.users.map((user)=>{
            if(user.id == id){

                if(user.leavesLeft <= 0){
                    return res.status(400).json({message:"You have exhausted all your leaves"})
                }
                const {dates,leaveDuration}=getDatesArray(fromDate,toDate);
                user.leaveDetails.push({leaveId,reason,dates})
                user.leavesLeft=user.leavesLeft-leaveDuration;
                
            }
            return user;
        })
        const newFileData=JSON.stringify({users:updatedFileData})

        await fs.writeFile(`${__dirname}/../../db/users.json`,newFileData,'utf8')
        return res.status(201).json({message:`Leave created successfully`})
        
    }catch(e){
        console.log(e)
        res.json({error:e.message})
    }
}

// It is used to modify the leaves of an admin/employee
export const updateLeave=async(req,res)=>{
    try{
        let {fromDate,toDate,reason}=req.body;
        if(!fromDate|| !toDate) return res.status(400).json({error:'Start date and End date is mandatory'});

        fromDate=getDate(fromDate);
        toDate=getDate(toDate);

        isDateInPast(toDate)

        const userId=req.auth.id;
        const leaveId=Number(req.params.leaveId);        
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        let leaveFound=false;
        const updatedUsers= fileData.users.map((user)=>{
            if(user.id == userId){
                let leave=user.leaveDetails.map((leave)=>{
                    if(leave.leaveId === leaveId){
                        leaveFound=true;
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
                user.leaveDetails=leave;
            }
            return user;
        })

        if(!leaveFound) return res.status(400).json({error:"This leave id does not exist."})

        const newUpdatedFile=JSON.stringify({users:updatedUsers})
        await fs.writeFile(`${__dirname}/../../db/users.json`,newUpdatedFile,'utf8')
        return res.json({message:'Leave updated successfully'})          

    }catch(e){
        console.log(e)
        return res.status(500).json({error:e.message})
    }   
}
