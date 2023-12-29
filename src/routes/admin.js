import express from 'express';
import { deleteAdmin,listAllAdmins } from '../controllers/admin.js';
import { applyForLeave,listAllAdminLeaves, updateLeave ,deleteLeave,listLeaves,updateLeaveByPutMethod,getLeaveDetails } from '../controllers/leave.js';
import { isAuth} from '../middlewares/isAuth.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { isSuperAdmin } from '../middlewares/isSuperAdmin.js';
const router=express.Router();

// Routes related to admin and can be accessed by admin only.
router.post('/admins/leaves',isAuth,isAdmin,applyForLeave)
router.patch('/admins/leaves/:leaveId',isAuth,isAdmin,updateLeave)
router.put('/admins/leaves/:leaveId',isAuth,isAdmin,updateLeaveByPutMethod)
router.delete('/admins/leaves/:leaveId',isAuth,isAdmin,deleteLeave)
router.get('/admins/leaves',isAuth,listLeaves)
router.get('admins/leaves/:leaveId',isAuth,getLeaveDetails)
router.get('/admins/leaves/:leaveId',isAuth,isAdmin,getLeaveDetails)



// Routes related to admin but can be accessed by superadmins oly
router.get('/admins',isAuth,isSuperAdmin,listAllAdmins)
router.delete('/admins/:adminId',isAuth,isSuperAdmin,deleteAdmin)
router.get('/admins/:adminId/leaves',isAuth,isSuperAdmin,listAllAdminLeaves)



export default router;