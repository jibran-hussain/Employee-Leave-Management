import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config'

import { generateId } from '../utils/Auth/generateId.js';
import { isDateInPast } from '../utils/Date/isDateInPast.js';
import { getDatesArray } from '../utils/Date/getDatesArray.js';
import { getDate } from '../utils/Date/getDate.js';
import { isValidDate } from '../utils/Date/isValidDate.js';
import { pagination } from '../utils/pagination.js';
import { filterLeavesByDate } from '../utils/leaves/filterLeavesByDate.js';
import { filterLeavesByMonth } from '../utils/leaves/filterLeavesByMonth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

// It is used to apply for leave

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

// It lists all leaves of a signed in user
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

// It list the particular leave of a logged in user

export const getLeaveDetails=async(req,res)=>{
    try{
        const employeeId=req.auth.id
        const leaveId=Number(req.params.leaveId);
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);
        let leave;
        await fileData.users.filter((user)=>{
            if(user.id === employeeId){
                leave=user.leaveDetails.filter((leave)=>leave.leaveId == leaveId)
            }
            return false;
        })
        if(leave.length == 0) return res.status(404).json({error:'Leave with this id does not exist'})
        return res.json({...leave[0]})
    }catch(e){
        return res.status(500).json({error:e.message})
    }
}


// It can be used by admin and superadmin
// It is used to fetch leave by leaveId

export const getLeaveById = async (req, res) => {
    try {
        const leaveId = Number(req.params.leavId);
        const data = await fs.readFile(`${__dirname}/../../db/users.json`, 'utf8');
        const fileData = JSON.parse(data);

        let foundLeave;
        let leave;
        fileData.users.forEach((user) => {
            console.log(user)
            if (user.leaveDetails && user.leaveDetails.length > 0) {
                const leave = user.leaveDetails.find((l) => l.leaveId === leaveId);
                if (leave) {
                    foundLeave = leave;
                }
            }
        });

        if (foundLeave) {
            return res.json(foundLeave);
        } else {
            return res.status(404).json({ error: 'Leave not found' });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: e.message });
    }
};

// It is used to get all leaves in a system

export const getAllLeaves = async (req, res) => {
    try {
        
        const limit=Number(req.query.limit)
        const offset=Number(req.query.offset)
        const name=req.query.name;
        const date = req.query.date;
        const month=Number(req.query.month);

        if((limit && !offset) || (!limit && offset)) return res.status(400).json({error:'Either limit or offset is necassary'});

        const data = await fs.readFile(`${__dirname}/../../db/users.json`, 'utf8');
        const fileData = JSON.parse(data);

        let totalLeaves=0;
        const allLeavesWithUsers = [];
        fileData.users.forEach((user) => {
            if(name && !user.name.toLowerCase().includes(name.toLowerCase())) return ;
            if (user.leaveDetails && user.leaveDetails.length > 0) {
                user.leaveDetails.forEach((leave) => {
                    if(date){
                        const leavesMatchingDate = filterLeavesByDate(user, date);
                        console.log(leavesMatchingDate)
                        allLeavesWithUsers.push(...leavesMatchingDate);
                        totalLeaves += leavesMatchingDate.length;
                    }else if(month){
                        const leavesMatchingMonth=filterLeavesByMonth(user,month-1);
                        allLeavesWithUsers.push(...leavesMatchingMonth);
                        totalLeaves += leavesMatchingMonth.length;
                    }else{
                        const leaveWithUser = {
                            id: user.id,
                            name: user.name,
                            role:user.role,
                            leaveDetails: leave,
                        };
                        totalLeaves++;
                        allLeavesWithUsers.push(leaveWithUser);
                    }
                });
            }
        });

        if(limit && offset){
            const paginatedArray=pagination(allLeavesWithUsers,offset,limit);
            return res.json({leaves:paginatedArray,records:paginatedArray.length,totalLeaves})
        }

        return res.json({leaves:allLeavesWithUsers,totalLeaves});
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: e.message });
    }
};



