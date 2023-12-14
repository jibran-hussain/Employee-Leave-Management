import jwt from 'jsonwebtoken'
import 'dotenv/config'

export const isSuperAdmin=async(req,res,next)=>{
    try{
        const token=req.cookies.jwt;
        console.log
        if(!token) return res.status(401).json({message: "Unauthorized (Token is missing)"})
        const {role} = jwt.verify(token,process.env.JWT_SECRET_KEY);
        if(role != 'superadmin') return res.status(401).json({message:"Unauthorized"})
        next()
    }catch(e){
        return res.status(401).json({error:e.message})
    }
}