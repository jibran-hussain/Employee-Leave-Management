import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import 'dotenv/config'
import { pagination } from '../utils/pagination.js';

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
        const limit=Number(req.query.limit)
        const offset=Number(req.query.offset)

        if((limit && !offset) || (!limit && offset)) return res.status(400).json({error:'Either limit or offset is necassary'});

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

        const adminCount=admins.length;

        if(limit && offset){
            const paginatedArray=pagination(admins,offset,limit);
            console.log(paginatedArray)
            return res.json({employees:paginatedArray,records:paginatedArray.length,totalAdmins:adminCount})
        }
        return res.json({admins,records:admins.length,totalAdmins:adminCount})
    }catch(e){
        return res.status(500).json({message:`Internal server error`})
    }
}
