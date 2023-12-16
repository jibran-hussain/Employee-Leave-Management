export const validateLeave = (date) => {
    try {
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



