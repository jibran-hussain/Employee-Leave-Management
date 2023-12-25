import express from 'express';
import { applyForLeave,deleteLeave,listAllLeaves,updateLeave,deleteAdmin } from '../controllers/admin.js';
import { isAuth} from '../middlewares/isAuth.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { isSuperAdmin } from '../middlewares/isSuperAdmin.js';
import { isAdminOrSuperadmin } from '../middlewares/isAdminOrSuperadmin.js';
const router=express.Router();

// Routes related to admin and can be accessed by admin only.
router.post('/admins/leaves',isAuth,isAdmin,applyForLeave)
router.patch('/admins/leaves/:leaveId',isAuth,isAdmin,updateLeave)
router.delete('/admins/leaves/:leaveId',isAuth,deleteLeave)

// Routes related to admin but can be accessed by superadmins oly
router.delete('/admins/:adminId',isAuth,isSuperAdmin,deleteAdmin)
router.get('/admins/:adminId/leaves',isAuth,isSuperAdmin,listAllLeaves)

// Routes related to admin but can be accessed by both admin and superadmin. If logged in as an admin,it lists leaves of that admin only and if
// logged as superadmin it will list leaves of admin whose id has been passed in params
router.get('/admins/leaves',isAuth,isAdminOrSuperadmin,listAllLeaves)


export default router;