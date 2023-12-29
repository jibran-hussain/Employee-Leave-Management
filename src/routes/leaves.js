import express from 'express'
import { applyForLeave,listLeaves,updateLeave,updateLeaveByPutMethod,deleteLeave,getLeaveDetails,listAllEmployeeLeaves } from '../controllers/leave.js';
import { isAuth } from '../middlewares/isAuth.js';
import { isEmployee } from '../middlewares/isEmployee.js';
import { isAdminOrSuperadmin } from '../middlewares/isAdminOrSuperadmin.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router= express.Router();


// Leave routes related to normal employees
router.post('/employees/leaves',isAuth,isEmployee,applyForLeave)
router.get('/employees/leaves',isAuth,listLeaves);
router.patch('/employees/leave/:leaveId',isAuth,isEmployee,updateLeave)
router.put('/employees/leave/:leaveId',isAuth,isEmployee,updateLeaveByPutMethod)
router.delete('/employees/leaves/:leaveId',isAuth,isEmployee,deleteLeave)
router.get('/employees/:employeeId/leaves',isAuth,isAdminOrSuperadmin,listAllEmployeeLeaves)
router.get('/employees/leaves/:leaveId',isAuth,isEmployee,getLeaveDetails)

// Leave routes related to admins
router.post('/admins/leaves',isAuth,isAdmin,applyForLeave)
router.get('/admins/leaves',isAuth,listLeaves)
router.patch('/admins/leaves/:leaveId',isAuth,isAdmin,updateLeave)
router.put('/admins/leaves/:leaveId',isAuth,isAdmin,updateLeaveByPutMethod)
router.delete('/admins/leaves/:leaveId',isAuth,isAdmin,deleteLeave)
router.get('/admins/leaves/:leaveId',isAuth,isAdmin,getLeaveDetails)

export default router;