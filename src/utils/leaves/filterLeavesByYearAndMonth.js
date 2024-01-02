import { getDate } from "../Date/getDate.js";

// It returns all those leaves applied in a particular year and particular month.

export const filterLeavesByMonthAndYear = (user,leave,month, year) => {
    try{
        const leavesMatchingYearAndMonth = [];
        const currentDate=new Date() ;
        currentDate.setUTCHours(0,0,0,0);
        if(year > currentDate.getFullYear()) throw new Error(`You can only see current and previous year's leave`);
        if(month < 0 && month >11) throw new Error(`Please enter a valid month`)
        for (const ld of leave.dates) {
            const leaveDate = getDate(ld);
            if (leaveDate.getFullYear() === year && leaveDate.getMonth() === month) {
                const leaveWithUser = {
                    date:ld,
                    reason:leave.reason,
                    leaveId:leave.leaveId
                  };
                  leavesMatchingYearAndMonth.push(leaveWithUser);
            }
      }
       return leavesMatchingYearAndMonth;
    }catch(e){
        console.log(e);
        throw Error(e.message);
    }
  };