import express from 'express';
import { applyForLeave,deleteLeave,listAllLeaves,updateLeave,deleteAdmin } from '../controllers/admin.js';
import { isAuth} from '../middlewares/isAuth.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { isSuperAdmin } from '../middlewares/isSuperAdmin.js';
import { isAdminOrSuperadmin } from '../middlewares/isAdminOrSuperadmin.js';
const router=express.Router();

router.post('/admins/leaves',isAuth,isAdmin,applyForLeave)
router.get('/admins/leaves',isAuth,isAdminOrSuperadmin,listAllLeaves)
router.patch('/admins/leaves/:leaveId',isAuth,isAdmin,updateLeave)
router.delete('/admins/leaves/:leaveId',isAuth,deleteLeave)
router.delete('/admins/:adminId',isAuth,isSuperAdmin,deleteAdmin)
router.get('/admins/:adminId/leaves',isAuth,isSuperAdmin,listAllLeaves)

export default router;