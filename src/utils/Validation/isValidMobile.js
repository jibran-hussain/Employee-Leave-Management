// Checks if a mobile number is valid or not

export const isValidNumber=(mobileNumber)=>{
    if(!Number(mobileNumber)) throw new Error('Please enter a valid mobile Number')

    if(mobileNumber.toString().length != 10) throw new Error('Mobile Number should be of 10 digits only')
}