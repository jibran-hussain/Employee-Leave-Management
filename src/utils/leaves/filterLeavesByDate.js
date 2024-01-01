import { isValidDate } from "../Date/isValidDate.js";
import { getDate } from "../Date/getDate.js";

export const filterLeavesByDate = (user,leave, date) => {
    const leavesMatchingDate = [];
    const selectedDate = getDate(date);
    if (isValidDate(selectedDate)) return leavesMatchingDate;

      leave.dates.forEach((ld) => {
        const leaveDate = getDate(ld);
        if (leaveDate.getTime() === selectedDate.getTime()) {
          const leaveWithUser = {
            date:ld,
            reason:leave.reason,
            leaveId:leave.leaveId
          };
          leavesMatchingDate.push(leaveWithUser);
        }
      });
   
  
    return leavesMatchingDate;
  };