import express from 'express';
import { deleteAdmin,listAllAdmins } from '../controllers/admin.js';
import {listAllAdminLeaves} from '../controllers/leave.js';
import { isAuth} from '../middlewares/isAuth.js';
import { isSuperAdmin } from '../middlewares/isSuperAdmin.js';
import {isAdminOrSuperadmin} from '../middlewares/isAdminOrSuperadmin.js'
const router=express.Router();

// Routes related to admin and can be accessed by admin only.




// Routes related to admin but can be accessed by superadmins oly
router.get('/admins',isAuth,isAdminOrSuperadmin,listAllAdmins)
router.delete('/admins/:adminId',isAuth,isSuperAdmin,deleteAdmin)
router.get('/admins/:adminId/leaves',isAuth,isSuperAdmin,listAllAdminLeaves)



export default router;