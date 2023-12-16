import jwt from 'jsonwebtoken';
import 'dotenv/config'

export const generateAuthToken=(id,email,role)=>{
    try{
        const token=jwt.sign({id,email,role},process.env.JWT_SECRET_KEY);
        return token;
    }catch(error){
        throw new Error(`Error while generating token. Please try again`)
    }
}