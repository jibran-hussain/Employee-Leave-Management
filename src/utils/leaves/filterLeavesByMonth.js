import { getDate } from "../Date/getDate.js";

export const filterLeavesByMonth = (user, month) => {
  console.log(user)
    const leavesMatchingMonth = [];
    if(month < 0 || month > 11) return [];  
    user.leaveDetails.forEach((leave) => {
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
    });
  
    return leavesMatchingMonth;
  };