import { isValidDate } from "../Date/isValidDate.js";
import { getDate } from "../Date/getDate.js";

export const filterLeavesByDate = (user, date) => {
    const leavesMatchingDate = [];
    const selectedDate = getDate(date);
    if (isValidDate(selectedDate)) return leavesMatchingDate;
  
    user.leaveDetails.forEach((leave) => {
      leave.dates.forEach((ld) => {
        const leaveDate = getDate(ld);
        if (leaveDate.getTime() === selectedDate.getTime()) {
          const leaveWithUser = {
            id: user.id,
            name: user.name,
            role: user.role,
            leaveDetails: leave,
          };
          leavesMatchingDate.push(leaveWithUser);
        }
      });
    });
  
    return leavesMatchingDate;
  };