import express from 'express'
import { applyForLeave,listLeaves,updateLeave,updateLeaveByPutMethod,deleteLeave,getLeaveDetails,listAllEmployeeLeaves,getLeaveById,getAllLeaves } from '../controllers/leave.js';
import { isAuth } from '../middlewares/isAuth.js';
import { isEmployee } from '../middlewares/isEmployee.js';
import { isAdminOrSuperadmin } from '../middlewares/isAdminOrSuperadmin.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router= express.Router();


// Routes which logged in users can access
router.post('me/leaves',isAuth,applyForLeave)
router.get('/me/leaves',isAuth,listLeaves);
router.patch('me/leave/:leaveId',isAuth,updateLeave)
router.put('/me/leave/:leaveId',isAuth,updateLeaveByPutMethod)
router.delete('/me/leaves/:leaveId',isAuth,deleteLeave)
router.get('/me/leaves/:leaveId',isAuth,getLeaveDetails)

// Routes which superadmin and admin can access
router.get('/employees/:employeeId/leaves',isAuth,isAdminOrSuperadmin,listAllEmployeeLeaves)
router.get('/employees/leaves/:leaveId',isAuth,isAdminOrSuperadmin,getLeaveById)
router.get('/leaves',isAuth,isAdminOrSuperadmin,getAllLeaves)

export default router;