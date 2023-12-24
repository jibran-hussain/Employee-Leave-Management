import express from 'express'
import { isAdmin } from '../middlewares/isAdmin.js';
import {deleteEmployee,applyForLeave,listAllLeaves,updateLeaves, deleteLeave,getAllLeavesofEmployee} from '../controllers/employee.js'
import { isAuth } from '../middlewares/isAuth.js';
import { isEmployee } from '../middlewares/isEmployee.js';
import { isAdminOrSuperadmin } from '../middlewares/isAdminOrSuperadmin.js';
const router=express.Router();

router.post('/employees/leaves',isAuth,isEmployee,applyForLeave)
router.get('/employees/leaves',isAuth,listAllLeaves);
router.patch('/employees/leave/:leaveId',isAuth,isEmployee,updateLeaves)
router.delete('/employees/leaves/:leaveId',isAuth,deleteLeave)
router.delete('/employees/:employeeId',isAuth,isAdminOrSuperadmin,deleteEmployee)
router.get('/employees/:employeeId/leaves',isAuth,isAdminOrSuperadmin,getAllLeavesofEmployee)   



export default router;