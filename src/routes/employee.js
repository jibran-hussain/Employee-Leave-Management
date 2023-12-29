import express from 'express'
import {deleteEmployee,listAllEmployees,listAllDisabledEmployees,activateAccount,getLoggedUsersDetails,updateProfile,getEmployeeDetails,updateEmployeeProfile,updatedProfileByPutMethod,updateEmployeeProfileByPut,resetPassword} from '../controllers/employee.js'
import { isAuth } from '../middlewares/isAuth.js';
import { isAdminOrSuperadmin } from '../middlewares/isAdminOrSuperadmin.js';
const router=express.Router();



router.get('/employees',isAuth,isAdminOrSuperadmin,listAllEmployees)
router.delete('/employees/:employeeId',isAuth,isAdminOrSuperadmin,deleteEmployee)
router.get('/employees/disabled',isAuth,isAdminOrSuperadmin,listAllDisabledEmployees)
router.post('/employee/:employeeId/activate',isAuth,isAdminOrSuperadmin,activateAccount)
router.get('/employees/:employeeId',isAuth,isAdminOrSuperadmin,getEmployeeDetails)
router.patch("/employee/:employeeId",isAuth,isAdminOrSuperadmin,updateEmployeeProfile)
router.put("/employee/:employeeId",isAuth,isAdminOrSuperadmin,updateEmployeeProfileByPut)

// Route which everyone can access
router.get('/me',isAuth,getLoggedUsersDetails)
router.patch('/me',isAuth,updateProfile)
router.put('/me',isAuth,updatedProfileByPutMethod)
router.delete('/me',isAuth,deleteEmployee)
router.patch('/me/password',isAuth,resetPassword)



export default router;