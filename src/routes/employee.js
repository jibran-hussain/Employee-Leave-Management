import express from 'express'
import { isAdmin } from '../middlewares/isAdmin';
import {createEmployee,employeeSingin} from '../controllers/employee.js'
const router=express.Router();

router.post('/employees/signup',isAdmin,createEmployee);
router.post('/employees/signin',employeeSingin)


export default router;  