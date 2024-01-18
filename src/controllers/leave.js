import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config'

import { isDateInPast } from '../utils/Date/isDateInPast.js';
import { getDatesArray } from '../utils/Date/getDatesArray.js';
import { getDate,getDateForDB } from '../utils/Date/getDate.js';
import { isValidDate } from '../utils/Date/isValidDate.js';
import { pagination } from '../utils/pagination.js';
import { generateTimestamp } from '../utils/Date/generateTimestamp.js';
import Leave from '../models/leaves.js';
import Employee from '../models/employee.js';
import getTotalLeaveDays from '../utils/leaves/getTotalLeaveDays.js';
import { getTotalLeaveDaysInSystem,getTotalApplicationsInSystem } from '../utils/leaves/systemLevelLeaveDetails.js';

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
    
        if(fromDate > toDate) return res.status(400).json({error:`Please enter a valid range`})
        
        if(isValidDate(fromDate) || isValidDate(toDate)) return res.status(400).json({error:'Please enter valid date'})

        isDateInPast(toDate)

        const {dates,leaveDuration}=await getDatesArray(id,fromDate,toDate,true);

        // Check if leaves are exhausted or not
        const employee=await Employee.findByPk(id);
        if(employee.leavesLeft <= 0) return res.status(403).json({message:"You have exhausted all your leaves"})

        if(dates.length > employee.leavesLeft) return res.status(403).json({error: `You have only ${employee.leavesLeft} leaves left and you are applying for  ${dates.length} days`})

        const leave =await Leave.create({reason,employeeId:id,dates})

        await employee.update({leavesLeft:employee.leavesLeft-leaveDuration});
        
        return res.status(201).json({message:`Leave created successfully`})
        
    }catch(e){
        console.log(e)
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
            const {paginatedArray,currentPage,totalPages}=pagination(user[0]?.leaveDetails,offset,limit);
            return res.json({leaves:paginatedArray,records:paginatedArray.length,leavesTaken,currentPage,totalPages})
        }
        
        return res.json({leaves:user[0]?.leaveDetails,records:user[0]?.leaveDetails.length,leavesTaken})
    }catch(e){
        return res.status(500).json({message:`Internal Server Error`})
    }

}

export const listAllEmployeeLeaves=async (req,res)=>{
    try{

        const employeeId=Number(req.params.employeeId)

        const employee= await Employee.findByPk(employeeId);
        if(!employee) return res.status(404).json({error:`Emplyee with this id does not exist`});

        const limit=Number(req.query.limit) || 10;
        const offset=Number(req.query.offset) || 1;

        if((limit && !offset) || (!limit && offset)) return res.status(400).json({error:'Either limit or offset is necassary'});

        const startIndex = (offset - 1)*limit;

        const {count,rows:allLeaves}=await Leave.findAndCountAll({
            where:{
                employeeId
            },
            attributes:{
                exclude:['employeeId']
            },
            offset: startIndex || undefined,
            limit: limit || undefined
        })

        if(limit && offset){
            const totalPages=Math.ceil(count/ limit);

            if(offset > totalPages) return res.status(404).json({error:`This page does not exist`})

            const {totalLeaveDays,timesApplied}=await getTotalLeaveDays(employeeId)

            return res.json({data:allLeaves,metadata:{
                totalLeaveDays,
                timesApplied,
                currentPage:offset,
                totalPages
            }})
        }

        return res.json({data:allLeaves})

    }catch(e){
        return res.status(500).json({error:`Internal Server Error`})
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

        const employeeId=req.auth.id;
        const leaveId=Number(req.params.leaveId);     

        // Get employee details
        const employee=await Employee.findByPk(employeeId)
        
        const leave=await Leave.findByPk(leaveId);
        if(!leave || (leave && leave.employeeId !=  employeeId)) return res.status(404).json({error:`Leave not found`});

        const currentDate=new Date();
        currentDate.setUTCHours(0,0,0,0)

            console.log(getDateForDB(leave.dates[leave.dates.length-1]) ,currentDate,getDateForDB(leave.dates[leave.dates.length-1]) < currentDate)
        if(getDateForDB(leave.dates[leave.dates.length-1]) < currentDate) return res.status(403).json({error:'You cannot update this leave'})
        let leavesDeleted=0;
        const newDates=[]
        leave.dates.map(leaveDate=>{
            // console.log(getDateForDB(leaveDate),currentDate,getDateForDB(leaveDate) < currentDate)
            if(getDateForDB(leaveDate) < currentDate){
                newDates.push(leaveDate)
            }else leavesDeleted++;
        })
         const {dates,leaveDuration}=await getDatesArray(employeeId,fromDate,toDate,true);
         console.log(dates,'kljgksdfjglksdjglk')
         if(employee.leavesLeft - leavesDeleted + leaveDuration > 20) return res.status(403).json({error: 'You do not have enough leaves left'}) ;

        leavesDeleted=leavesDeleted-dates.length;

        const dateRange=[...newDates,...dates];

        if(dateRange.length === 0) return res.status(403).json({error:`You cannot update this leaving. Try deleting it and creating a new one`})

        // Updating leaves
        await Leave.update({dates:[...dateRange]},{
            where:{
                id:leaveId
            }
        })

        //  Updating leavesLeft for Employee
        await Employee.update({leavesLeft:employee.leavesLeft+leavesDeleted},{
            where:{
                id:employeeId
            }
        })

        return res.json({message:'Leave updated successfully'})          

    }catch(e){
        console.log(e)
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

        // Generating the timestamp
        const currentDate=new Date();
        const timestamp=currentDate.getTime();

        const promises= fileData.users.map(async (user)=>{
            if(user.id == userId){
                let leave=await Promise.all(user.leaveDetails.map(async(leave)=>{
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
                        const addedLeaveDays=await getDatesArray(userId,fromDate,toDate);

                        if(user.leavesLeft - leavesDeleted + addedLeaveDays.dates.length > 20) leaveLimitExceeded=true;

                        leave.dates=[...newDates,...addedLeaveDays.dates];
                        leavesDeleted=leavesDeleted-addedLeaveDays.dates.length
                        if(reason) leave.reason=reason

                        leave.lastModified=timestamp;
                    }
                    return leave
                }))
                user.leaveDetails=leave;
                user.leavesLeft=user.leavesLeft + leavesDeleted;
            }
            return user;
        })
        const updatedUsers=await Promise.all(promises)

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
        const employeeId=req.auth.id;
        const leaveId=Number(req.params.leaveId);

        // Get employee Details
        const employee=await Employee.findByPk(employeeId)

        const leave=await Leave.findByPk(leaveId);
        console.log(leave)
        if(!leave || (leave.employeeId != employeeId)) return res.status(404).json({error:`Leave does not exist`});

        const currentDate=new Date();
        currentDate.setUTCHours(0,0,0,0)

        if(getDateForDB(leave.dates[leave.dates.length-1]) < currentDate) return res.status(403).json({error:'You cannot delete this leave as it is of past'})

        const pastDates=[]

        leave.dates.forEach(leaveDate=>{
            if(getDateForDB(leaveDate) < currentDate) pastDates.push(leaveDate)
        })

        if(pastDates.length == 0){
        await Employee.update({leavesLeft:employee.leavesLeft + leave.dates.length},{
            where:{
                id:employeeId
            }
        })

            await Leave.destroy({
                where:{id:leaveId}
            })

        }else{
            await Employee.update({leavesLeft:employee.leavesLeft + (leave.dates.length - pastDates.length)},{
                where:{
                    id:employeeId
                }
            })

            await leave.update({dates:[...pastDates]},{
                where:{
                    id:leaveId
                }
            })
        }

        
        return res.json({message:' Leave deleted successfully'})

    }catch(e){
        return res.status(500).json({error:e.message})
    }
}

export const deleteLeaveByDate=async(req,res)=>{
    try{
        const userId=req.auth.id;
        const dateToDelete=req.params.date;

        if(isValidDate(getDate(dateToDelete))) return res.status(400).json({error:`Please enter a valid date`}); 
        if(isDateInPast(getDate(dateToDelete))) return res.status(403).json({error:`This date is of past. You cannot delete it`}); 

        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);

        let isApplied=false;

        const updatedUsers=fileData.users.map((user)=>{
            if(user.id === userId){
                const updatedLeaveDetails=user.leaveDetails.map((leave)=>{
                    const newDates=leave.dates.filter(date=>{
                        if(getDate(date).getTime() === getDate(dateToDelete).getTime()){
                            isApplied=true;
                            const timestamp=generateTimestamp();
                            leave.lastModified=timestamp;
                            return false;
                        }
                        return true;
                    })
                    leave.dates=newDates;
                    return leave;
                })
                user.leaveDetails=updatedLeaveDetails;
            }
            return user;
        })

        if(!isApplied) return res.status(404).json({error:'You have not applied for leave on this date'});

        const newUpdatedFile=JSON.stringify({users:updatedUsers})
        await fs.writeFile(`${__dirname}/../../db/users.json`,newUpdatedFile,'utf8')
        return res.json({message:' Leave deleted successfully'})

    }catch(e){
        console.log(e);
        return res.status(500).json({error:e.message})
    }
}

// It lists all leaves of a signed in user
export const listLeaves=async(req,res)=>{
    try{

        const limit=Number(req.query.limit) || 10
        const offset=Number(req.query.offset) || 1;

        if((limit && !offset) || (!limit && offset)) return res.status(400).json({error:'Either limit or offset is necassary'});

        const startIndex = (offset - 1)*limit;


        const employeeId=req.auth.id;
        const allLeaves= await Leave.findAll({
            where:{
                employeeId
            },
            attributes:{
                exclude:['employeeId']
            },
            offset:startIndex || undefined,
            limit:limit ||undefined
        })

        const {totalLeaveDays,timesApplied}=await getTotalLeaveDays(employeeId);

        if(limit && offset){
            const totalPages=Math.ceil(timesApplied/ limit);

            if(offset > totalPages) return res.status(404).json({error:`This page does not exist`});

            return res.json({data:allLeaves,metadata:{
                totalLeaveApplications:timesApplied,
                totalLeaveDays,
                page:offset,
                totalPages
            }})
        }
        return res.json({data:allLeaves})
    }catch(e){
        console.log(e)
        return res.status(500).json({error:e.message});
    }
}

// It list the particular leave of a logged in user

export const getLeaveDetails=async(req,res)=>{
    try{
        const employeeId=req.auth.id
        const leaveId=Number(req.params.leaveId);

        const leave=await Leave.findByPk(leaveId);
        
        if(!leave || leave.employeeId != employeeId) return res.status(404).json({error:`Leave with this id does not exist`})

        return res.json({data:leave})
    }catch(e){
        return res.status(500).json({error:e.message})
    }
}


// It can be used by admin and superadmin
// It is used to fetch leave by leaveId

export const getLeaveById = async (req, res) => {
    try {
        const leaveId = Number(req.params.leaveId);

        const leave = await Leave.findByPk(leaveId);

        if(!leave) return res.status(404).json({error:`Leave not found`});

        return res.json({data:leave})
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: e.message });
    }
};

// It is used to get all leaves in a system

export const getAllLeaves = async (req, res) => {
    try {
        const limit=Number(req.query.limit) || 10;
        const offset=Number(req.query.offset) || 1;

        if((limit && !offset) || (!limit && offset)) return res.status(400).json({error:'Either limit or offset is necassary'});

        const startIndex = (offset - 1)*limit;

       const {count,rows:allLeaves}=await Leave.findAndCountAll({
        offset:startIndex || undefined,
        limit: limit || undefined
       });


       let totalLeaves=0;

       allLeaves.forEach(leave=> totalLeaves=totalLeaves+leave.dates.length)

       if(limit && offset){
        const totalPages=Math.ceil(count/limit)
        if(offset > totalPages) return res.status(404).json({error:`This page does not exist`})

        const totalLeaveDays=await getTotalLeaveDaysInSystem();
        const totalApplications= await getTotalApplicationsInSystem();

        // console.log(totalApplications,totalLeaveDays,'sdgsdgisdgudoisufgiodfsugsiodfugsdoigusoigusoigusdoifgu')

        return res.json({data:allLeaves,metadata:{
            totalLeaveDays,
            totalApplications,
            currentPage:offset,
            totalPages
        }})
       }

       return res.json({data:allLeaves,metadata:{
        totalLeaves
       }})
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: e.message });
    }
};



