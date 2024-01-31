import Leave from "../../models/leaves.js";

const getTotalLeaveDays=async(employeeId)=>{
    try{
       const allLeaves= await Leave.findAll({
            where:{
                employeeId
            }
        })
        
        let totalLeaveDays=0;
        const timesApplied=allLeaves.length;
        allLeaves.forEach(leave=>totalLeaveDays=totalLeaveDays+leave.dates.length)

        return {totalLeaveDays,timesApplied};

    }catch(e){
        throw(e);
    }
}

export default getTotalLeaveDays;