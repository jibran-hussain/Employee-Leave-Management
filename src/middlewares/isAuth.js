import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import {dirname} from 'path';
import jwt from 'jsonwebtoken';
import "dotenv/config"
import Employee from '../models/employee.js';

export const isAuth=async(req,res,next)=>{
    try{
        const jwtToken=req.headers.authorization.split(' ')[1];
        if(!jwtToken) return res.status(401).json({message:`Unauthorized (Token missing)`});
        const decodedToken=jwt.verify(jwtToken,process.env.JWT_SECRET_KEY);
        const {id}=decodedToken;

        // Check if the user has been deactivated or not
        const employee=await Employee.findByPk(id);
        if(!employee) return res.status(403).json({error:'You are deactivated by the admin. You are not authorized to do anything.'})

        req.auth=decodedToken;
        next()
    }catch(e){
        return res.status(403).json({message:`Internal server error`})
    }
}