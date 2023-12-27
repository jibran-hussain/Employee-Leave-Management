import express from 'express'
import {deleteEmployee,listAllEmployeeLeaves,listAllEmployees,listAllDisabledEmployees,activateAccount,getLoggedUsersDetails} from '../controllers/employee.js'
import { applyForLeave,updateLeave,deleteLeave } from '../controllers/leave.js';
import { isAuth } from '../middlewares/isAuth.js';
import { isEmployee } from '../middlewares/isEmployee.js';
import { isAdminOrSuperadmin } from '../middlewares/isAdminOrSuperadmin.js';
const router=express.Router();

// Routes related to employee which only employee can access
router.post('/employees/leaves',isAuth,isEmployee,applyForLeave)
router.get('/employees/leaves',isAuth,isEmployee,listAllEmployeeLeaves);
router.patch('/employees/leave/:leaveId',isAuth,isEmployee,updateLeave)
router.delete('/employees/leaves/:leaveId',isAuth,isEmployee,deleteLeave)

// Routes related to employee details which Admin and Superadmin can access
router.get('/employees/:employeeId/leaves',isAuth,isAdminOrSuperadmin,listAllEmployeeLeaves)
router.get('/employees',isAuth,isAdminOrSuperadmin,listAllEmployees)
router.get('/employees/disabled',isAuth,isAdminOrSuperadmin,listAllDisabledEmployees)
router.post('/employee/:employeeId/activate',isAuth,isAdminOrSuperadmin,activateAccount)
router.delete('/employees/:employeeId',isAuth,isAdminOrSuperadmin,deleteEmployee)



// Route which everyone can access
router.get('/me',isAuth,getLoggedUsersDetails)


export default router;