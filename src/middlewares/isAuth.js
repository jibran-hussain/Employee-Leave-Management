import jwt from 'jsonwebtoken';
import "dotenv/config"

export const isAuth=async(req,res,next)=>{
    try{
        const jwtToken=req.cookies.jwt;
        if(!jwtToken) return res.status(401).json({message:`Unauthorized (Token missing)`});
        const decodedToken=jwt.verify(jwtToken,process.env.JWT_SECRET_KEY);
        req.auth=decodedToken;
        console.log(req.auth,`here is the docoded token`)
        next()
    }catch(e){
        return res.status(401).json({message:`Invalid Token`})
    }
}