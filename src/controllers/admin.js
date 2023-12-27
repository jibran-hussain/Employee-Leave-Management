import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import jwt from 'jsonwebtoken'
import 'dotenv/config'

import { generateId } from '../utils/generateId.js';
import { isDateInPast } from '../utils/isDateInPast.js';
import { getDatesArray } from '../utils/getDatesArray.js';
import { getDate } from '../utils/getDate.js';
import { isValidDate } from '../utils/isValidDate.js';
import { runInNewContext } from 'vm';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)


// It deletes an admin from a JSON Database
export const deleteAdmin=async (req,res)=>{
    try{
        const userId=Number(req.params.adminId)
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        
        const updatedUsersList= fileData.users.map((user)=>{
            if(user.id == userId) user.active=false;
            return user;
        })
        fileData.users=updatedUsersList;
        const finalFileData=JSON.stringify(fileData);
        await fs.writeFile(`${__dirname}/../../db/users.json`,finalFileData,'utf8')
        return res.json({message:"Admin Deleted Successfully"})
        
    }catch(e){
        return res.json({error:e.message})
    }
}


export const listAllAdmins=async(req,res)=>{
    try{
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);
        const admins=fileData.users.filter((user)=>{
            if(user.role === 'admin' && user.active === true){
                user.hashedPassword=undefined;
                user.active=undefined;
                return true;
            }
            return false;
        })
        return res.json({admins})
    }catch{
        return res.status(500).json({message:`Internal Server Error`})
    }
}
