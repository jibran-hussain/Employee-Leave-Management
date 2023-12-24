import 'dotenv/config'

export const isAdminOrSuperadmin=async(req,res,next)=>{
    try{
        const {role}=req.auth;
        if(role != 'admin' && role!= 'superadmin') return res.status(401).json({message:"Unauthorized"})
        next()
    }catch(e){
        return res.status(401).json({error:e.message})
    }
}