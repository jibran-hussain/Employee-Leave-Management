import express from 'express';
import { createAdmin,adminSignin,applyForLeave,deleteAdmin,listAllLeaves,updateLeave } from '../controllers/admin.js';
import { isSuperAdmin } from '../middlewares/isSuperAdmin.js';
import { isAuth} from '../middlewares/isAuth.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { updateLeaves } from '../controllers/employee.js';
const router=express.Router();

router.post('/auth/admins/signup',isAuth,isSuperAdmin,createAdmin);
router.post('/auth/admins/signin',adminSignin)
router.delete('/admins/:adminId',isAuth,isSuperAdmin,deleteAdmin)
router.post('/admins/leaves',isAuth,isAdmin,applyForLeave)
router.get('/admins/leaves',isAuth,isAdmin,listAllLeaves)
router.patch('/admins/leaves/:leaveId',isAuth,isAdmin,updateLeave)

export default router;