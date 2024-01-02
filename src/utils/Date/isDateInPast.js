// Takes date as input and checks if this date is of past or not

export const isDateInPast=(date)=>{
    try{
        const selectedDate=date ;
        const currentDate=new Date();
        currentDate.setUTCHours(0,0,0,0)
        if(selectedDate < currentDate) throw new Error("This operation could not be performed as it is of past")
        return false;
    }catch(error){
        throw new Error(error.message)
    }
}