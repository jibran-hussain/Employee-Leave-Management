import express from 'express'
const router=express.Router();
import { isSuperAdmin } from '../middlewares/isSuperAdmin.js';
import { isAuth } from '../middlewares/isAuth.js';
import { deleteAdmin } from '../controllers/admin.js';

router.delete('/admins/:adminId',isAuth,isSuperAdmin,deleteAdmin)

export default router;