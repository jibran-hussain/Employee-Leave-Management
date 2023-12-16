export const validateLeave=(date)=>{
    try{
        const [day,month,year]=date.split('-').map(Number);
        const selectedDate=new Date(year,month,day);
        const currentDate=new Date();
        console.log(selectedDate,"here is the selected data")
        if(selectedDate <= currentDate) return res.status(400).json({message:`You cannot apply leave on date from the past`});
        if(selectedDate.getDay() == 5 || selectedDate.getDay() == 6) return res.status(400).json({message:`It's a weekend, already a holiday`})
    }catch(e){
        console.log(e)       
    }
}