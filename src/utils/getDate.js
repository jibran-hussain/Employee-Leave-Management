export const getDate=(date)=>{
    console.log('here is the dateeeerrrrrrrrrre',typeof date,date)
    const [day, month, year] = date.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    return selectedDate;
}