import { getDate } from "../Date/getDate.js";

export const filterLeavesByYear = (user,leave, year) => {
    try{
        const leavesMatchingYear = [];
        const currentDate=new Date() ;
        currentDate.setUTCHours(0,0,0,0);
        if(year > currentDate.getFullYear()) throw new Error(`You can only see current and previous year's leave`);
        for (const ld of leave.dates) {
            const leaveDate = getDate(ld);
            if (leaveDate.getFullYear() === year) {
            const leaveWithUser = {
                id: user.id,
                name: user.name,
                role: user.role,
                leaveDetails: leave,
            };
            leavesMatchingYear.push(leaveWithUser);
            break;
            }
      }
       return leavesMatchingYear;
    }catch(e){
        console.log(e);
        throw Error(e.message);
    }
  };