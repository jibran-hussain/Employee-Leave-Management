import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import bcrypt from 'bcrypt'
import {isValidPassword} from '../utils/isValidPassword.js'
import { isValidEmail , passwordValidation} from '../utils/validations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)


export const deleteAdmin=async (req,res)=>{
    try{
        const adminId=req.params.adminId
        const data=await fs.readFile(`${__dirname}/../../db/admin.json`,'utf8')
        const fileData=JSON.parse(data);
        
        const updatedAdminList= fileData.admins.filter((admin)=>{
            if(admin.adminId == adminId) return false;
            return admin;
        })
        fileData.admins=updatedAdminList;
        const finalFileData=JSON.stringify(fileData);
        await fs.writeFile(`${__dirname}/../../db/admin.json`,finalFileData,'utf8')
        return res.json({message:"Admin Deleted Successfully"})
        
    }catch(e){
        return res.json({error:e})
    }
}

