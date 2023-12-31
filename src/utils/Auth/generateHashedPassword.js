import bcrypt from 'bcrypt';
import 'dotenv/config'

export const generateHashedPassword=(plainPassword)=>{
    try{
        const hashedPassword = bcrypt.hashSync(plainPassword,Number(process.env.SALT_ROUNDS));
        return hashedPassword;
    }catch(e){
        throw(e)
    }
}