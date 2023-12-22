export const isValidDate=(startDate)=>{
    if(startDate instanceof Date || startDate != 'Invalid Date') return false;
    return true;
}