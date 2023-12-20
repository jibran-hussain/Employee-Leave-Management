export const validateLeave = (date) => {
    try {
        const dateRegex = /^\d{2}-\d{2}-2023$/;
        if(!date.match(dateRegex)) throw new Error(`Please enter a valid date. Date should be in DD-MM-2023 format`)
        const [day, month, year] = date.split('-').map(Number);
        const selectedDate = new Date(year, month - 1, day);
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



