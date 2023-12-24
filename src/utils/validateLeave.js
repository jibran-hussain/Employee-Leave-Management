import { getDate } from "./getDate.js";

export const validateLeave = (date) => {
    try {
        const dateRegex = /^\d{2}-\d{2}-202\d{1}$/;
        if(!date.match(dateRegex)) throw new Error(`Please enter a valid date. Date should be in DD-MM-2023 format`)
        const selectedDate =getDate(date);
        const currentDate = new Date();
        if (selectedDate < currentDate) {
            throw new Error(`You cannot apply for leave on a date from the past.`);
        }

        if (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) {
            throw new Error(`It's a weekend, already a holiday.`);
        }
        return true;
    } catch (e) {
        console.log(e)
        throw(e); 
    }
};



                                