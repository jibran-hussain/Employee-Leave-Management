import express from 'express'
const router=express.Router();
import { SuperadminSignin } from '../controllers/superadmin.js';

router.post('/signin',SuperadminSignin);

export default router;