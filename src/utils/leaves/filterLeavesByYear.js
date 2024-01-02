import { getDate } from "../Date/getDate.js";

// It returns all those leaves applied in a particular year

export const filterLeavesByYear = (user,leave, year) => {
    try{
        const leavesMatchingYear = [];
        const currentDate=new Date() ;
        currentDate.setUTCHours(0,0,0,0);
        const matchingLeaves=[]
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