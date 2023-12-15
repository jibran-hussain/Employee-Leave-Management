import express from 'express'
import { isAdmin } from '../middlewares/isAdmin';
import {createEmployee,employeeSingin,applyForLeave,listAllLeaves,updateLeaves} from '../controllers/employee.js'
import { isAuth } from '../middlewares/isAuth.js';
import { isEmployee } from '../middlewares/isEmployee.js';
const router=express.Router();

router.post('/employees/signup',isAuth,isAdmin,createEmployee);
router.post('/employees/signin',employeeSingin)
router.post('/employees/leaves',isAuth,isEmployee,applyForLeave)
router.get('/employees/:employeeId/leaves',isAuth,isEmployee,listAllLeaves);
router.patch('/employees/:employeeId/leave/:leaveId',isAuth,isEmployee,updateLeaves)


export default router;  