import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config'
import bcrypt from 'bcrypt';
import { generateHashedPassword } from '../utils/Auth/generateHashedPassword.js';
import { pagination } from '../utils/pagination.js';
import { isValidNumber } from '../utils/Validation/isValidMobile.js';
import { isValidEmail, passwordValidation } from '../utils/Validation/validations.js';
import { sort } from '../utils/sort.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)


// This method gives the list of all active employees.
// Can be accessed by only admin and superadmin
// Can sort them bassed on name, role, salary in ascending and descending order. Can also search them by name.

export const listAllEmployees=async(req,res)=>{
    try{
        const limit=Number(req.query.limit)
        const offset=Number(req.query.offset)
        const sortBy=req.query.sortBy;
        const order=req.query.order === 'desc' ? -1 : 1;
        const name=req.query.name
        const number=req.query.number;

        if((limit && !offset) || (!limit && offset)) return res.status(400).json({error:'Either limit or offset is necassary'});

        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);
        
        const employees=fileData.users.filter((user)=>{
            if(user.active === false) return false;
            if(name){
                if (user.role === 'employee' || user.role === 'admin') {
                    const userName = user.name.toLowerCase();
                    const queryName = name.toLowerCase();
                    if (userName.includes(queryName)) {
                        user.hashedPassword = undefined;
                        user.active = undefined;
                        return true;
                    }
                }
            }else if(number){
                if (user.role === 'employee' || user.role === 'admin'){
                    const mobileNumber=user.mobileNumber.toString();
                    if(mobileNumber.includes(number)){
                        user.hashedPassword = undefined;
                        user.active = undefined;
                        return true;
                    }
                }
            }else{
                if(user.role === 'employee' || user.role === 'admin'){
                    user.hashedPassword=undefined;
                    user.active=undefined
                    return user;
                }
            }
            return false;
        })
        const totalEmployees=employees.length;

        sort(employees,sortBy,order)
        

        if(limit && offset){
            const paginatedArray=pagination(employees,offset,limit);
            return res.json({employees:paginatedArray,records:paginatedArray.length,totalEmployees,page:offset})
        }

        return res.json({employees,totalEmployees})
    }catch(e){
        return res.status(500).json({message:e.message})
    }
}

// This method gives the list of all deactivated employees.
// Can be accessed by only admin and superadmin
// Can sort them bassed on name, role, salary in ascending and descending order. Can also search them by name.

export const listAllDisabledEmployees=async (req,res)=>{
    try{
        const limit=Number(req.query.limit)
        const offset=Number(req.query.offset)
        const sortBy=req.query.sortBy;
        const order=req.query.order === 'desc' ? -1 : 1;
        const name=req.query.name
        const number = req.query.number;

    
        if((limit && !offset) || (!limit && offset)) return res.status(400).json({error:'Either limit or offset is necassary'});

        const data=await fs.readFile('./db/users.json','utf8');
        const fileData=JSON.parse(data);
        const disabledEmployees=fileData.users.filter(user=>{
            if(user.active === false){
                if(name){
                    const userName = user.name.toLowerCase();
                    const queryName = name.toLowerCase();
                    if (userName.includes(queryName)) {
                        user.hashedPassword = undefined;
                        user.active = undefined;
                        return true;
                    }
                }else if(number){
                    if(user.role === 'employee' || user.role === 'admin'){
                        const mobileNumber=user.mobileNumber.toString();
                        if(mobileNumber.includes(number)){
                            user.hashedPassword = undefined;
                            user.active = undefined;
                            return true;
                        }
                    }
                }else{
                    user.hashedPassword=undefined;
                    user.active=undefined;
                    return true;
                }
            }
            return false;
        });

        sort(disabledEmployees,sortBy,order);
        const totalDisableEmployees=disabledEmployees.length;

        if(limit && offset){
            const paginatedArray=pagination(disabledEmployees,offset,limit);
        const totalDisableEmployees=disabledEmployees.length;
            return res.json({leaves:paginatedArray,records:paginatedArray.length,totalDisableEmployees,page:offset})
        }
        return res.json({disabledEmployees,records:totalDisableEmployees})
    }catch(e){
        console.log(e)
        return res.status(500).json({error:e.message})
    }
}

// It activates the employee account.
// Admin and Superadmin can activate employees account and Superadmin can activate admin's account.
// Admin cannot activate fellow admin's account

export const activateAccount=async (req,res)=>{
    try{

        const userId=Number(req.params.employeeId)
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        
        let userToActivate;
        let updatedUsersList;
        if(req.auth.role === 'superadmin'){
                updatedUsersList= fileData.users.map((user)=>{
                if(user.id === userId){
                    user.active=true;
                    userToActivate=user;
                };
                return user;
            })
        }else if(req.auth.role === 'admin'){
                updatedUsersList= fileData.users.map((user)=>{
                if(user.id === userId && user.role === 'admin') userToActivate=user;
                if(user.id === userId && user.role === 'employee'){
                    user.active=true;
                    userToActivate=user;
                };
                return user;
            })
        }
        if(!userToActivate) return res.status(404).json({error:'Employee with this id does not exist'})
        if(req.auth.role === 'admin' && userToActivate.role === 'admin') return res.status(403).json({error:`You cannot activate another admins account`})

        fileData.users=updatedUsersList;
        const finalFileData=JSON.stringify(fileData);
        await fs.writeFile(`${__dirname}/../../db/users.json`,finalFileData,'utf8')
        return res.json({message:"Employee account activated Successfully"})
        
    }catch(e){
        return res.status(500).json({error:e.message})
    }
}


// Give the details of the logged in user.
// Can be accessed by everyone who is logged in irrespective of role

export const getLoggedUsersDetails=async(req,res)=>{
    try{
        const {id:userId,role}=req.auth;
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);

        const user=fileData.users.filter((user)=>user.id === userId && user.role === role);
        user[0].hashedPassword=undefined;
        user[0].active=undefined;
        return res.json({user:user[0]})

    }catch(e){
        return res.status(500).json({error:e.message})
    }
}

// It deletes an employee.
// Admin can delete normal employees account but cannot delete fellow admin's account.
// Superadmin can delete both admin's and employee's account
// It does not delete permenantly, it does soft delete so the user can be reactivated.

export const deleteEmployee=async (req,res)=>{
    try{
        const userId=Number(req.params.employeeId)
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8')
        const fileData=JSON.parse(data);
        
        let userToDelete;
        let updatedUsersList;
        if(req.auth.role === 'superadmin'){
                updatedUsersList= fileData.users.map((user)=>{
                if(user.id === userId){
                    user.active=false;
                    userToDelete=user;
                }
                else if(user.id === req.auth.id) userToDelete=user;
                return user;
            })
        }
        else if(req.auth.role === 'admin'){
                updatedUsersList= fileData.users.map((user)=>{
                if(user.id === req.auth.id){
                    user.active=false;
                    userToDelete={...user};
                    userToDelete.role='me';
                }
                else if(user.id === userId && user.role === 'admin') userToDelete=user;
                else if(user.id === userId && user.role === 'employee'){
                    user.active=false;
                    userToDelete=user;
                };
                return user;
            })
        }
        else if(req.auth.role === 'employee'){
            updatedUsersList = fileData.users.map((user)=>{
                if(user.id === req.auth.id){
                    userToDelete=user;
                    user.active=false;
                }
                return user;
            })
        }

        if(!userToDelete) return res.status(404).json({error:'Employee with this id does not exist'})
        if(userToDelete.role === 'superadmin') return res.status(403).json({error:`Nobody is authorized to delete superadmin`})
        if(req.auth.role === 'admin' && userToDelete.role === 'admin') return res.status(403).json({error:`You cannot delete another admins`})

        fileData.users=updatedUsersList;
        const finalFileData=JSON.stringify(fileData);
        await fs.writeFile(`${__dirname}/../../db/users.json`,finalFileData,'utf8')
        return res.json({message:"Employee Deleted Successfully"})
        
    }catch(e){
        return res.status(500).json({error:e.message})
    }
}

// Superadmin,Admin,Employees can update their profile

export const updateProfile= async(req,res)=>{
    try{
        const userId=req.auth.id;
        const {name,email,mobileNumber}=req.body;
        // Fetching the logged in user
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);
        const updatedUsers=fileData.users.map((user)=>{
            if(user.id === userId){
                if(name) user.name=name;
                if(email) user.email=email;
                if(mobileNumber) {
                    isValidNumber(mobileNumber)
                    user.mobileNumber=mobileNumber
                }
            }
            return user;
        })
        fileData.users=updatedUsers;
        const updatedFile=JSON.stringify(fileData)

        // Writing the changes in the file with updated user data
        await fs.writeFile(`${__dirname}/../../db/users.json`,updatedFile,'utf8')
        return res.json({message:"User updated Successfully"})
    }catch(e){
        return res.status(500).json({error:e.message})
    }
}

// It is used to fetch employee's details by its id.
// Admin and Superadmin can fetch everyone's detail.

export const getEmployeeDetails= async(req,res)=>{
    try{
        const employeeId=Number(req.params.employeeId);
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);
        const user=fileData.users.filter((user)=>user.id == employeeId)
        if(user.length == 0) return res.status(404).json({error:`Employee with id does not exist`});
        user[0].hashedPassword=undefined
        return res.json({employee:user[0]})
    }catch(e){
        return res.status(500).json({error:e.message})
    }
}


// It will be used by admin and superadmin to update employees deatils.
// Admin's cannot update their fellow admin's details.

export const updateEmployeeProfile=async(req,res)=>{
    try{
        const userId=Number(req.params.employeeId);
        const {name,email,mobileNumber,role,password,salary}=req.body;
        if(email && !isValidEmail(email)) return res.status(400).json({error:"Please enter valid email address"})
        if(mobileNumber) isValidNumber(mobileNumber);
        if(salary && !Number(salary)) return res.status(400).json({error:"Please enter valid salary"})
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);
        const updatedUsers=fileData.users.map((user)=>{
            if(user.id === userId){
                if(user.role === 'admin' && req.auth.role === 'admin') throw new Error('Admin cannot update other admins')
                
                if(name) user.name=name;
                if(email) user.email=email;
                if(mobileNumber) user.mobileNumber=mobileNumber;
                if(role) user.role=role
                if(password) user.hashedPassword=generateHashedPassword(password);
                if(salary) user.salary=salary
            }
            return user;
        })
        fileData.users=updatedUsers;
        const updatedFile=JSON.stringify(fileData)
        await fs.writeFile(`${__dirname}/../../db/users.json`,updatedFile,'utf8')
        return res.json({message: 'Employee updated successfully'})
    }catch(e){
        return res.status(500).json({error:e.message})
    }
}


export const updateEmployeeProfileByPut=async(req,res)=>{
    try{
        const userId=Number(req.params.employeeId);
        const {name,email,mobileNumber,role,password,salary}=req.body;
        if(!name || !email || !mobileNumber || !role || !password || !salary) return res.status(400).json({error:`All fields are mandatory`}) 
        if(email && !isValidEmail(email)) return res.status(400).json({error:"Please enter valid email address"})
        if(mobileNumber) isValidNumber(mobileNumber);
        if(salary && !Number(salary)) return res.status(400).json({error:"Please enter valid salary"})
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);
        const updatedUsers=fileData.users.map((user)=>{
            if(user.id === userId){
                if(user.role === 'admin' && req.auth.role === 'admin') throw new Error('Admin cannot update other admins')
                
                if(name) user.name=name;
                if(email) user.email=email;
                if(mobileNumber) user.mobileNumber=mobileNumber;
                if(role) user.role=role
                if(password) user.hashedPassword=generateHashedPassword(password);
                if(salary) user.salary=salary
            }
            return user;
        })
        fileData.users=updatedUsers;
        const updatedFile=JSON.stringify(fileData)
        await fs.writeFile(`${__dirname}/../../db/users.json`,updatedFile,'utf8')
        return res.json({message: 'Employee updated successfully'})
    }catch(e){
        return res.status(500).json({error:e.message})
    }
}


export const updatedProfileByPutMethod= async(req,res)=>{
    try{
        const userId=req.auth.id;
        const {name,email,mobileNumber}=req.body;
        if(!name || !email || !mobileNumber || !password) return res.status(400).json({error:`All fields are mandatory`})
        // Fetching the logged in user
        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);
        const updatedUsers=fileData.users.map((user)=>{
            if(user.id === userId){
                if(name) user.name=name;
                if(email) user.email=email;
                if(mobileNumber) {
                    isValidNumber(mobileNumber)
                    user.mobileNumber=mobileNumber
                }
            }
            return user;
        })
        fileData.users=updatedUsers;
        const updatedFile=JSON.stringify(fileData)

        // Writing the changes in the file with updated user data
        await fs.writeFile(`${__dirname}/../../db/users.json`,updatedFile,'utf8')
        return res.json({message:"User updated Successfully"})
    }catch(e){
        return res.status(500).json({error:e.message})
    }
}

// It resets the password of currently logged in user

export const resetPassword=async(req,res)=>{
    try{
        const userId=req.auth.id;
        const {oldPassword,newPassword,confirmPassword}=req.body
        if(!oldPassword || !newPassword || !confirmPassword) return res.status(400).json({error:`All fields are necassary`});
        if(newPassword.toString() !== confirmPassword.toString()) return res.status(400).json({error:`New Password and confirm password should be same`})
        
        if(passwordValidation(newPassword) || passwordValidation(confirmPassword)) return res.status(400).json({error:`Password cannot be empty and should have more than 3 characters`})


        const data=await fs.readFile(`${__dirname}/../../db/users.json`,'utf8');
        const fileData=JSON.parse(data);

        // check if the old password is correct or not
        const user=fileData.users.find((user)=>user.id === userId)
        const isValidPassword=await bcrypt.compare(oldPassword,user.hashedPassword);
        if(!isValidPassword)    return res.status(400).json({error:`You have entered incorrect old password`});
        const newHashedPassword= generateHashedPassword(newPassword)

        const updatedUsers=fileData.users.map((user)=>{
            if(user.id === userId){
                user.hashedPassword=newHashedPassword
            }
            return user;
        })

        fileData.users=updatedUsers;
        const updatedFile=JSON.stringify(fileData);
        await fs.writeFile(`${__dirname}/../../db/users.json`,updatedFile,'utf8');
        return res.json({message:"Password changed successfully"})
    }catch(e){
        console.log(e)
        return res.status(500).json({error:e.message})
    }
}