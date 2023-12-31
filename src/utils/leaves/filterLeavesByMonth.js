import { getDate } from "../Date/getDate.js";

export const filterLeavesByMonth = (user,leave, month) => {
    const leavesMatchingMonth = [];
    if(month < 0 || month > 11) return [];  
      for (const ld of leave.dates) {
        const leaveDate = getDate(ld);
        if (leaveDate.getMonth() === month) {
          const leaveWithUser = {
            id: user.id,
            name: user.name,
            role: user.role,
            leaveDetails: leave,
          };
          leavesMatchingMonth.push(leaveWithUser);
          break;
        }
      }
  
    return leavesMatchingMonth;
  };