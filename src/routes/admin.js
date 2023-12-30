import express from 'express';
import { deleteAdmin,listAllAdmins } from '../controllers/admin.js';
import { applyForLeave,listAllAdminLeaves, updateLeave ,deleteLeave,listLeaves,updateLeaveByPutMethod,getLeaveDetails } from '../controllers/leave.js';
import { isAuth} from '../middlewares/isAuth.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { isSuperAdmin } from '../middlewares/isSuperAdmin.js';
const router=express.Router();

// Routes related to admin and can be accessed by admin only.




// Routes related to admin but can be accessed by superadmins oly
router.get('/admins',isAuth,isSuperAdmin,listAllAdmins)
router.delete('/admins/:adminId',isAuth,isSuperAdmin,deleteAdmin)
router.get('/admins/:adminId/leaves',isAuth,isSuperAdmin,listAllAdminLeaves)



export default router;