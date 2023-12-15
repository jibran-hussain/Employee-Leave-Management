import express from 'express'
import { isAdmin } from '../middlewares/isAdmin';
import {createEmployee,employeeSingin,applyForLeave,listAllLeaves} from '../controllers/employee.js'
import { isAuth } from '../middlewares/isAuth.js';
import { isEmployee } from '../middlewares/isEmployee.js';
const router=express.Router();

router.post('/employees/signup',isAuth,isAdmin,createEmployee);
router.post('/employees/signin',employeeSingin)
router.post('/employees/leave',isAuth,isEmployee,applyForLeave)
router.get('/employees/leaves',isAuth,isEmployee,listAllLeaves)


export default router;  