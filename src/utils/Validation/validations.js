import validator from 'validator';

export const isValidEmail=(email)=>{
    try{
        if(!validator.isEmail(email)) return false
        return true;
    }catch(e){
        throw(e.message)
    }
}

export const passwordValidation=(password)=>{
    try{
        if(password.length < 4) return true;
        if(validator.isEmpty(password,{ignore_whitespace:true})) return true;
        return false;
    }catch(e){
        throw(e);
    }
}