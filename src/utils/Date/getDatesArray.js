import { isAlreadyLeave } from "../leaves/isAlreadyLeave.js";

// Genrates the dates between the range of dates for applying leave excluding the day if it is a weekend or on this day user has already applied for leave

export const getDatesArray= async (userId,fromDate,toDate)=>{
    try{
        let dates=[]
        let leaveDuration=0;

        const startDate=fromDate;
        const endDate=toDate;
        const currentDate=new Date();
        currentDate.setUTCHours(0,0,0)

        while(startDate <= endDate){
            const alreadyApplied= await isAlreadyLeave(userId,startDate);
            
            if (startDate.getDay() === 0 || startDate.getDay() === 6 || alreadyApplied ){
                startDate.setDate(startDate.getDate()+1);
                continue;
            }
            
            dates.push(`${startDate.getDate() < 10?'0':''}${startDate.getDate()}-${startDate.getMonth()+1 < 10?'0':''}${startDate.getMonth()+1}-${startDate.getFullYear()}`);
            leaveDuration++;
            startDate.setDate(startDate.getDate()+1);
        }
        return {dates,leaveDuration}
        
    }catch(e){
        console.log(e)
    }
}