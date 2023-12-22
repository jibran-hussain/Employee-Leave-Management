import { getDate } from "./getDate.js"

export const getDatesArray=(fromDate,toDate)=>{
    try{
        let dates=[]
        let leaveDuration=0;

        const startDate=fromDate;
        const endDate=toDate;
        const currentDate=new Date();

        while(startDate <= endDate){
            if (startDate < currentDate || startDate.getDay() === 0 || startDate.getDay() === 6 ){
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