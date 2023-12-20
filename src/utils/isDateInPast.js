export const isDateInPast=(date)=>{
    try{
        const [day,month,year]=date.split("-").map(Number);
        const selectedDate=new Date(year,month-1,day);
        const currentDate=new Date();
        console.log(selectedDate < currentDate,"leeeeeeeeeeeeeeeeaaaaaaaavvvvve")
        if(selectedDate < currentDate) throw new Error("This operation could not be performed as it is of past")
        return false;
    }catch(error){
        throw new Error(error.message)
    }
}