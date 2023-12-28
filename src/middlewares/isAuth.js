import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import {dirname} from 'path';
import jwt from 'jsonwebtoken';
import "dotenv/config"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export const isAuth=async(req,res,next)=>{
    try{
        const jwtToken=req.headers.authorization.split(' ')[1];
        if(!jwtToken) return res.status(401).json({message:`Unauthorized (Token missing)`});
        const decodedToken=jwt.verify(jwtToken,process.env.JWT_SECRET_KEY);
        const {id}=decodedToken;

        // Check if the user has been deactivated or not
        const data=await fs.readFile('./db/users.json','utf8');
        const fileData=JSON.parse(data)
        const user=fileData.users.filter((user)=>user.id === id);
        if(user[0].active === false) return res.status(403).json({error:'You are deactivated by the admin. You are not authorized to do anything.'})

        req.auth=decodedToken;
        next()
    }catch(e){
        return res.status(403).json({message:`Unauthorized. Access denied`})
    }
}