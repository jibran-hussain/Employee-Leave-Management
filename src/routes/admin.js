import express from 'express';
import { createAdmin,adminSignin } from '../controllers/admin.js';
import { isSuperAdmin } from '../middlewares/isSuperAdmin.js';
import { isAuth } from '../middlewares/isAuth.js';
const router=express.Router();

router.post('/auth/admins/signup',isAuth,isSuperAdmin,createAdmin);
router.post('/auth/admins/signin',adminSignin)

export default router;