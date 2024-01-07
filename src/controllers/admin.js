import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import 'dotenv/config'
import { pagination } from '../utils/pagination.js';
import { sort } from '../utils/sort.js';

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
        const sortBy=req.query.sortBy;
        const order=req.query.order === 'desc' ? -1 : 1;
        const name=req.query.name
        const number=req.query.number;

        if((limit && !offset) || (!limit && offset)) return res.status(400).json({error:'Either limit or offset is necassary'});

        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);
        const admins=fileData.users.filter((user)=>{
            if(user.active === false) return false;
            if(name){
                if (user.role === 'admin') {
                    const userName = user.name.toLowerCase();
                    const queryName = name.toLowerCase();
                    if (userName.includes(queryName)) {
                        user.hashedPassword = undefined;
                        user.active = undefined;
                        return true;
                    }
                }
            }else if(number){
                if (user.role === 'admin'){
                    const mobileNumber=user.mobileNumber.toString();
                    if(mobileNumber.includes(number)){
                        user.hashedPassword = undefined;
                        user.active = undefined;
                        return true;
                    }
                }
            }
            else if(user.role === 'admin'){
                user.hashedPassword=undefined;
                user.active=undefined;
                return true;
            }

            return false;
        
        })
        

        const adminCount=admins.length;

        sort(admins,sortBy,order)

        if(limit && offset){
            const {paginatedArray,totalPages,currentPage}=pagination(admins,offset,limit);
            return res.json({employees:paginatedArray,records:paginatedArray.length,totalAdmins:adminCount,currentPage,totalPages})
        }
        return res.json({admins,records:admins.length,totalAdmins:adminCount})
    }catch(e){
        return res.status(500).json({message:e.message})
    }
}
