import express from 'express'
const router=express.Router();
import { superadminSignin } from '../controllers/superadmin.js';

router.post('/auth/signin',superadminSignin);

export default router;