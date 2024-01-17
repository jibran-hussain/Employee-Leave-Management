import { getDateForDB } from '../Date/getDate.js';
import Leave from '../../models/leaves.js';

// Checks if the employee is already on leave on a particular date or not

export const isAlreadyLeave=async(employeeId,date)=>{
    try{
        const allLeaves= await Leave.findAll({
            where:{
                employeeId
            }
        })

        let isAlreadyLeave=false;
        allLeaves.forEach(leave=>{
            leave.dates.forEach(leaveDate=>{
                if(getDateForDB(leaveDate).getTime() === date.getTime()) isAlreadyLeave=true;
            })
        })

        return isAlreadyLeave;
    }catch(e){
        console.log(e);
    }
}