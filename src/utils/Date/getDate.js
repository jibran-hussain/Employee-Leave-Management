export const getDate=(date)=>{
    
    const [day, month, year] = date.split('-').map(date=>Number(date));
    const selectedDate = new Date(Date.UTC(year, month-1, day,0,0,0));
    if(selectedDate.getFullYear() != year || selectedDate.getMonth() != month-1 || selectedDate.getDate() != day) throw new Error('Invalid date(s)')
    return selectedDate;
}