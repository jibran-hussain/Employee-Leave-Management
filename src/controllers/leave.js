import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config'

import { generateId } from '../utils/generateId.js';
import { isDateInPast } from '../utils/isDateInPast.js';
import { getDatesArray } from '../utils/getDatesArray.js';
import { getDate } from '../utils/getDate.js';
import { isValidDate } from '../utils/isValidDate.js';
import { pagination } from '../utils/pagination.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export const applyForLeave=async (req,res)=>{
    try{
        const {id}=req.auth;
        let {fromDate,toDate,reason}=req.body;

        if(!fromDate || !toDate || !reason) return res.status(400).json({error:`All fields are necassary`})

        fromDate=getDate(fromDate);
        toDate=getDate(toDate);
        
        if(isValidDate(fromDate) || isValidDate(toDate)) return res.status(400).json({error:'Please enter valid date'})

        isDateInPast(fromDate)
        isDateInPast(toDate)

        
        // Getting the leave id from id.json file
        let leaveId=await generateId("leave");
        
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        const updatedFileData=fileData.users.map((user)=>{
            if(user.id == id){

                if(user.leavesLeft <= 0){
                    return res.status(403).json({message:"You have exhausted all your leaves"})
                }
                const {dates,leaveDuration}=getDatesArray(fromDate,toDate);

                if(dates.length > user.leavesLeft) return res.status(403).json({error: `You have only ${user.leavesLeft} leaves left and you are applying for  ${dates.length} days`})

                user.leaveDetails.push({leaveId,reason,dates})
                user.leavesLeft=user.leavesLeft-leaveDuration;
                
            }
            return user;
        })
        const newFileData=JSON.stringify({users:updatedFileData})

        await fs.writeFile(`${__dirname}/../../db/users.json`,newFileData,'utf8')
        return res.status(201).json({message:`Leave created successfully`})
        
    }catch(e){
        res.json({error:e.message})
    }
}

// Lists all leaves of an admin who is currently logged in
export const listAllAdminLeaves=async (req,res)=>{
    try{

        const limit=Number(req.query.limit)
        const offset=Number(req.query.offset)

        if((limit && !offset) || (!limit && offset)) return res.status(400).json({error:'Either limit or offset is necassary'});

        let userId;
        let isAdminExisting=false;
        if(req.auth.role === 'admin') userId=req.auth.id;
        else if(req.auth.role === 'superadmin') userId=Number(req.params.adminId);
        else return res.status(403).json({error:'Unauthorized'})
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        const user=fileData.users.filter((user)=>{
            if(user.id === userId && user.role === 'admin') {
                isAdminExisting=true;
                return user;
            }
        })

        if(!isAdminExisting) return res.status(404).json({error:'Admin with this id does not exist'})

        const leavesTaken=20-user[0].leavesLeft;

        if(limit && offset){
            const paginatedArray=pagination(user[0]?.leaveDetails,offset,limit);
            return res.json({leaves:paginatedArray,records:paginatedArray.length,leavesTaken})
        }
        
        return res.json({leaves:user[0]?.leaveDetails,records:user[0]?.leaveDetails.length,leavesTaken})
    }catch(e){
        return res.status(500).json({message:`Internal Server Error`})
    }

}

export const listAllEmployeeLeaves=async (req,res)=>{
    try{

        const limit=Number(req.query.limit)
        const offset=Number(req.query.offset)

        if((limit && !offset) || (!limit && offset)) return res.status(400).json({error:'Either limit or offset is necassary'});

        const employeeId=Number(req.params.employeeId)
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        const user=fileData.users.filter((user)=>{
            if(user.id === employeeId && (user.role === 'employee' || user.role === 'admin')) {
                return user;
            }
        })
        if(user.length == 0) return res.status(404).json({error:'No employee with this id exists'})
        const leavesTaken=20-user[0].leavesLeft;

        if(limit && offset){
            const paginatedArray=pagination(user[0].leaveDetails,offset,limit);
            return res.json({leaves:paginatedArray,records:paginatedArray.length,leavesTaken})
        }

        return res.json({leaves:user[0].leaveDetails,records:user[0].leaveDetails.length,leavesTaken})
    }catch(e){
        return res.status(500).json({message:e.message})
    }

}

// It is used to modify the leaves of an admin/employee
export const updateLeave=async(req,res)=>{
    try{
        let {fromDate,toDate,reason}=req.body;
        if((fromDate && !toDate) || (toDate && ! fromDate)) return res.status(400).json({error:'Start date and End date is mandatory'});

        fromDate=getDate(fromDate);
        toDate=getDate(toDate);

        isDateInPast(toDate)

        const userId=req.auth.id;
        const leaveId=Number(req.params.leaveId);        
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        let leaveFound=false;
        let leavesDeleted=0;
        let leaveLimitExceeded=false;
        const updatedUsers= fileData.users.map((user)=>{
            if(user.id == userId){
                let leave=user.leaveDetails.map((leave)=>{
                    if(leave.leaveId === leaveId){
                        leaveFound=true;
                        const currentDate=new Date();
                        currentDate.setUTCHours(0,0,0,0)
                        if(currentDate > getDate(leave.dates[leave.dates.length-1])) throw new Error('You cannot update this leave')
                        // upate leave here
                        
                       const newDates= leave.dates.filter((date)=>{
                            if(getDate(date) < currentDate) return true;
                            leavesDeleted++;
                            return false;
                        })
                        const addedLeaveDays=getDatesArray(fromDate,toDate);
                        
                        if(user.leavesLeft - leavesDeleted + addedLeaveDays.dates.length > 20) leaveLimitExceeded=true;

                        leave.dates=[...newDates,...addedLeaveDays.dates];
                        leavesDeleted=leavesDeleted-addedLeaveDays.dates.length
                        if(reason) leave.reason=reason
                }
                    return leave
                })
                user.leaveDetails=leave;
                user.leavesLeft=user.leavesLeft + leavesDeleted;
            }
            return user;
        })
        if(leaveLimitExceeded) return res.status(403).json({error: 'You do not have enough leaves left'})
        if(!leaveFound) return res.status(404).json({error:"This leave id does not exist."})

        const newUpdatedFile=JSON.stringify({users:updatedUsers})
        await fs.writeFile(`${__dirname}/../../db/users.json`,newUpdatedFile,'utf8')
        return res.json({message:'Leave updated successfully'})          

    }catch(e){
        return res.status(500).json({error:e.message})
    }   
}

export const updateLeaveByPutMethod=async(req,res)=>{
    try{
        let {fromDate,toDate,reason}=req.body;
        if(!fromDate || !toDate || !reason) return res.status(400).json({error:'All fileds are mandatory'});

        fromDate=getDate(fromDate);
        toDate=getDate(toDate);

        isDateInPast(toDate)

        const userId=req.auth.id;
        const leaveId=Number(req.params.leaveId);        
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        let leaveFound=false;
        let leavesDeleted=0;
        let leaveLimitExceeded=false;
        const updatedUsers= fileData.users.map((user)=>{
            if(user.id == userId){
                let leave=user.leaveDetails.map((leave)=>{
                    if(leave.leaveId === leaveId){
                        leaveFound=true;
                        const currentDate=new Date();
                        currentDate.setUTCHours(0,0,0,0)
                        if(currentDate > getDate(leave.dates[leave.dates.length-1])) throw new Error('You cannot update this leave')
                        // upate leave here
                        
                       const newDates= leave.dates.filter((date)=>{
                            if(getDate(date) < currentDate) return true;
                            leavesDeleted++;
                            return false;
                        })
                        const addedLeaveDays=getDatesArray(fromDate,toDate);
                        
                        if(user.leavesLeft - leavesDeleted + addedLeaveDays.dates.length > 20) leaveLimitExceeded=true;

                        leave.dates=[...newDates,...addedLeaveDays.dates];
                        leavesDeleted=leavesDeleted-addedLeaveDays.dates.length
                        if(reason) leave.reason=reason
                    }
                    return leave
                })
                user.leaveDetails=leave;
                user.leavesLeft=user.leavesLeft + leavesDeleted;
            }
            return user;
        })
        if(leaveLimitExceeded) return res.status(403).json({error: 'You do not have enough leaves left'})
        if(!leaveFound) return res.status(404).json({error:"This leave id does not exist."})

        const newUpdatedFile=JSON.stringify({users:updatedUsers})
        await fs.writeFile(`${__dirname}/../../db/users.json`,newUpdatedFile,'utf8')
        return res.json({message:'Leave updated successfully'})          

    }catch(e){
        return res.status(500).json({error:e.message})
    }   
}

// It is used to delete a specific leave of an employee
export const deleteLeave=async(req,res)=>{
    try{
        const userId=req.auth.id;
        const leaveId=Number(req.params.leaveId);
        
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        let leaveExists=false;
        let deletedLevesCount=0
        const updatedUsers= fileData.users.map((user)=>{
            if(user.id == userId){
                let leave=user.leaveDetails.filter((leave)=>{
                    if(leave.leaveId === leaveId){
                        leaveExists=true;
                        const newDates=leave.dates.filter((date)=>{
                            if(getDate(date).getTime() < new Date().getTime()) return true;
                            deletedLevesCount++;
                            return false;
                        })
                        leave.dates=newDates;
                        if(newDates.length == 0) return false;
                        
                    }
                    return leave
                })
                user.leaveDetails=leave
                user.leavesLeft=user.leavesLeft + deletedLevesCount;
                return user;
            }
            return user;
        })
        if(!leaveExists) return res.status(404).json({error:'This leave id does not exist'})
        const newUpdatedFile=JSON.stringify({users:updatedUsers})
        await fs.writeFile(`${__dirname}/../../db/users.json`,newUpdatedFile,'utf8')
        return res.json({message:' Leave deleted successfully'})

    }catch(e){
        return res.status(500).json({error:e.message})
    }
}


export const listLeaves=async(req,res)=>{
    try{

        const limit=Number(req.query.limit)
        const offset=Number(req.query.offset)

        if((limit && !offset) || (!limit && offset)) return res.status(400).json({error:'Either limit or offset is necassary'});

        const userId=req.auth.id;
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);

        const user=fileData.users.filter((user)=>user.id === userId);
        if(user.length == 0) return res.status(404).json({error:`Employee with this id does not exist`})
        const leavesTaken=20-user[0].leavesLeft;
        if(limit && offset){
            const paginatedArray=pagination(user[0].leaveDetails,offset,limit);
            return res.json({leaves:paginatedArray,records:paginatedArray.length,leavesTaken})
        }

        return res.json({leaves:user[0].leaveDetails,leavesTaken});
    }catch(e){
        return res.status(500).json({error:'Internal Server Error'});
    }
}
