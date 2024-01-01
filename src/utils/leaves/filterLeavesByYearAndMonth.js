import { getDate } from "../Date/getDate.js";

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
                id: user.id,
                name: user.name,
                role: user.role,
                leaveDetails: leave,
            };
            leavesMatchingYearAndMonth.push(leaveWithUser);
            break;
            }
      }
       return leavesMatchingYearAndMonth;
    }catch(e){
        console.log(e);
        throw Error(e.message);
    }
  };