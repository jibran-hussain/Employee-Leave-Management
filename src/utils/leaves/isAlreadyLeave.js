import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getDate } from '../Date/getDate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

// Checks if the employee is already on leave on a particular date or not

export const isAlreadyLeave=async(userId,date)=>{
    try{
        const data=await fs.readFile(`${__dirname}/../../../db/users.json`, 'utf8');
        const fileData = JSON.parse(data);
        let alreadyApplied=false;
        const user=fileData.users.find(user=>user.id === userId);
        user.leaveDetails.forEach((leave)=>{
            leave.dates.forEach(leaveDate=>{
                if(getDate(leaveDate).getTime() === date.getTime()) alreadyApplied=true;
            })
        })
        return alreadyApplied;
    }catch(e){
        console.log(e);
    }
}