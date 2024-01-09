// Generating the timestamp

export const generateTimestamp=()=>{
    const currentDate=new Date();
    const timestamp=currentDate.getTime();

    return timestamp;
}