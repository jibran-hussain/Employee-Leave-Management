import express from 'express'
import {deleteEmployee,listAllEmployees,listAllDisabledEmployees,activateAccount,getLoggedUsersDetails,updateProfile,getEmployeeDetails,updateEmployeeProfile,updatedProfileByPutMethod,updateEmployeeProfileByPut} from '../controllers/employee.js'
import { applyForLeave,updateLeave,deleteLeave ,listAllEmployeeLeaves,listLeaves,updateLeaveByPutMethod} from '../controllers/leave.js';
import { isAuth } from '../middlewares/isAuth.js';
import { isEmployee } from '../middlewares/isEmployee.js';
import { isAdminOrSuperadmin } from '../middlewares/isAdminOrSuperadmin.js';
const router=express.Router();

// Routes related to employee which only employee can access
router.post('/employees/leaves',isAuth,isEmployee,applyForLeave)
router.get('/employees/leaves',isAuth,listLeaves);
router.patch('/employees/leave/:leaveId',isAuth,isEmployee,updateLeave)
router.put('/employees/leave/:leaveId',isAuth,isEmployee,updateLeaveByPutMethod)

router.delete('/employees/leaves/:leaveId',isAuth,isEmployee,deleteLeave)

// Routes related to employee details which Admin and Superadmin can access
router.get('/employees/:employeeId/leaves',isAuth,isAdminOrSuperadmin,listAllEmployeeLeaves)
router.get('/employees',isAuth,isAdminOrSuperadmin,listAllEmployees)
router.get('/employees/disabled',isAuth,isAdminOrSuperadmin,listAllDisabledEmployees)
router.post('/employee/:employeeId/activate',isAuth,isAdminOrSuperadmin,activateAccount)
router.delete('/employees/:employeeId',isAuth,isAdminOrSuperadmin,deleteEmployee)
router.get('/employees/:employeeId',isAuth,isAdminOrSuperadmin,getEmployeeDetails)
router.patch("/employee/:employeeId",isAuth,isAdminOrSuperadmin,updateEmployeeProfile)
router.put("/employee/:employeeId",isAuth,isAdminOrSuperadmin,updateEmployeeProfileByPut)

// Route which everyone can access
router.get('/me',isAuth,getLoggedUsersDetails)
router.patch('/me',isAuth,updateProfile)
router.put('/me',isAuth,updatedProfileByPutMethod)
router.delete('/me',isAuth,deleteEmployee)



export default router;