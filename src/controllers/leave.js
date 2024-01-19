import 'dotenv/config'
import { Op } from 'sequelize';
import { isDateInPast } from '../utils/Date/isDateInPast.js';
import { getDatesArray } from '../utils/Date/getDatesArray.js';
import { getDate,getDateForDB } from '../utils/Date/getDate.js';
import { isValidDate } from '../utils/Date/isValidDate.js';
import Leave from '../models/leaves.js';
import Employee from '../models/employee.js';
import getTotalLeaveDays from '../utils/leaves/getTotalLeaveDays.js';
import { getTotalLeaveDaysInSystem,getTotalApplicationsInSystem } from '../utils/leaves/systemLevelLeaveDetails.js';

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

        if(dates.length === 0 ) return res.status(403).json({message:`You are already on leave on these days`})

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
                exclude:['employeeId','deletedAt']
            },
            offset: startIndex || undefined,
            limit: limit || undefined
        })

        if(count === 0) return res.json({message:`The employee has not taken any leave yet`});

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

        if(getDateForDB(leave.dates[leave.dates.length-1]) < currentDate) return res.status(403).json({error:'You cannot update this leave'})
        let leavesDeleted=0;
        const pastDates=[]
        leave.dates.map(leaveDate=>{
            if(getDateForDB(leaveDate) < currentDate){
                pastDates.push(leaveDate)
            }else leavesDeleted++;
        })
         const {dates,leaveDuration}=await getDatesArray(employeeId,fromDate,toDate,false,leaveId);
         if(employee.leavesLeft - leavesDeleted + leaveDuration > 20) return res.status(403).json({error: 'You do not have enough leaves left'}) ;

        const dateRange=[...pastDates,...dates];

        if(dateRange.length === 0) return res.status(403).json({error:`You cannot update this leaving. Try deleting it and creating a new one`})

        const updatedLeave={
            dates:[...dateRange]
        }
        if(reason) updatedLeave.reason=reason;

        // Updating leaves
        await Leave.update(updatedLeave,{
            where:{
                id:leaveId
            }
        })

        //  Updating leavesLeft for Employee
        await Employee.update({leavesLeft:employee.leavesLeft + leavesDeleted - dates.length},{
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


        if((fromDate && !toDate) || (toDate && ! fromDate)) return res.status(400).json({error:'Start date and End date is mandatory'});

        const employeeId=req.auth.id;
        const leaveId=Number(req.params.leaveId);     

        // Get employee details
        const employee=await Employee.findByPk(employeeId)

        if(fromDate || toDate){
            fromDate=getDate(fromDate);
            toDate=getDate(toDate);

            isDateInPast(toDate)

            
            const leave=await Leave.findByPk(leaveId);
            if(!leave || (leave && leave.employeeId !=  employeeId)) return res.status(404).json({error:`Leave not found`});

            const currentDate=new Date();
            currentDate.setUTCHours(0,0,0,0)

            if(getDateForDB(leave.dates[leave.dates.length-1]) < currentDate) return res.status(403).json({error:'You cannot update this leave'})
            let leavesDeleted=0;
            const pastDates=[]
            leave.dates.map(leaveDate=>{
                if(getDateForDB(leaveDate) < currentDate){
                    pastDates.push(leaveDate)
                }else leavesDeleted++;
            })
            const {dates,leaveDuration}=await getDatesArray(employeeId,fromDate,toDate,true,{consider:true,leaveId});
            if(employee.leavesLeft - leavesDeleted + leaveDuration > 20) return res.status(403).json({error: 'You do not have enough leaves left'}) ;

            let dateRange=[...pastDates,...dates];

            if(dateRange.length === 0) return res.status(403).json({error:`You cannot update this leaving. Try deleting it and creating a new one`})
        }

        const updatedLeave={
            reason:null,
            dates:null
        }
        if(reason) updatedLeave.reason=reason;
        if(fromDate || toDate) updateLeave.dates=[...dateRange]

        // Updating leaves
        await Leave.update(updatedLeave,{
            where:{
                id:leaveId
            }
        })

        //  Updating leavesLeft for Employee
        await Employee.update({leavesLeft:employee.leavesLeft + leavesDeleted - dates.length},{
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

// It is used to delete a specific leave of an employee

export const deleteLeave=async(req,res)=>{
    try{
        const employeeId=req.auth.id;
        const leaveId=Number(req.params.leaveId);

        // Get employee Details
        const employee=await Employee.findByPk(employeeId)

        const leave=await Leave.findByPk(leaveId);
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
        const employeeId=req.auth.id;
        const dateToDelete=req.params.date;

        if(isValidDate(getDate(dateToDelete))) return res.status(400).json({error:`Please enter a valid date`}); 
        if(isDateInPast(getDate(dateToDelete))) return res.status(403).json({error:`This date is of past. You cannot delete it`}); 

        const [day,month,year]=dateToDelete.split('-');
        const dateForDb=`${year}-${month}-${day}`

        const employee=await Employee.findByPk(employeeId)

        const leave=await Leave.findOne({
            where:{
                employeeId,
                dates:{
                    [Op.contains]:[dateForDb]
                }
            }
        });

        if(!leave) return res.status(400).json({error:`You have not applied for leave on this date`}); 

        const updatedDates=leave.dates.filter(leaveDate=>{
            if(leaveDate === dateForDb) return false;
            return true
        })

        await Employee.update({leavesLeft:employee.leavesLeft+1},{
            where:{
                id:employeeId
            }
        })

        await Leave.update({dates:[...updatedDates]},{
            where:{
                id:leave.id
            }
        })

        return res.json({data:updatedDates})

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

        const leave = await Leave.findByPk(leaveId,{
            paranoid:false
        });

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



