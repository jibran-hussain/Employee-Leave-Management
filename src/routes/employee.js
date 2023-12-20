import express from 'express'
import { isAdmin } from '../middlewares/isAdmin.js';
import {createEmployee,employeeSingin,deleteEmployee,applyForLeave,listAllLeaves,updateLeaves, deleteLeave} from '../controllers/employee.js'
import { isAuth } from '../middlewares/isAuth.js';
import { isEmployee } from '../middlewares/isEmployee.js';
const router=express.Router();

router.post('/auth/employees/signup',isAuth,isAdmin,createEmployee);
router.post('/auth/employees/signin',employeeSingin)
router.delete('/employees/:employeeId',isAuth,isAdmin,deleteEmployee)
router.post('/employees/leaves',isAuth,isEmployee,applyForLeave)
router.get('/employees/leaves',isAuth,isEmployee,listAllLeaves);
router.patch('/employees/leave/:leaveId',isAuth,isEmployee,updateLeaves)
router.delete('/employees/leaves/:leaveId',isAuth,deleteLeave)


export default router;  