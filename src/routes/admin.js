import express from 'express';
import { createAdmin,adminSignin } from '../controllers/admin.js';
import { isSuperAdmin } from '../middlewares/isSuperAdmin.js';
import { isAuth } from '../middlewares/isAuth.js';
const router=express.Router();

router.post('/admins/signup',isAuth,isSuperAdmin,createAdmin);
router.post('/admins/signin',adminSignin)

export default router;