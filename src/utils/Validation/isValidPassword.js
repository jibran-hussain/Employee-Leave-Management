import bcrypt from 'bcrypt';

export const isValidPassword=(plainPassword,hash)=>{
    try{
        const isValid=bcrypt.compareSync(plainPassword,hash);
        if(!isValid) return false;
        return true;
    }catch(e){
        throw(e);
    }
}