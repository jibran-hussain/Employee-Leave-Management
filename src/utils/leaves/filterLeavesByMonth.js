import { getDate } from "../Date/getDate.js";

// It returns all those leaves applied in a particular month

export const filterLeavesByMonth = (user,leave, month) => {
    const leavesMatchingMonth = [];
    if(month < 0 || month > 11) return [];  
      for (const ld of leave.dates) {
        const leaveDate = getDate(ld);
        if (leaveDate.getMonth() === month) {
          const leaveWithUser = {
            date:ld,
            reason:leave.reason,
            leaveId:leave.leaveId
          };
          leavesMatchingMonth.push(leaveWithUser);
        }
      }
  
    return leavesMatchingMonth;
  };