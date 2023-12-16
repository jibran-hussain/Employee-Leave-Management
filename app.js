import express from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import employeeRoute from './src/routes/employee.js'
import superadminRoute from './src/routes/superadmin.js'
import adminRoute from './src/routes/admin.js'

const app=express();
const PORT=process.env.port || 8000

app.use(cookieParser())
app.use(express.json())
app.use(`/api/${process.env.API_VERSION}`,superadminRoute)
app.use(`/api/${process.env.API_VERSION}`,adminRoute)
app.use(`/api/${process.env.API_VERSION}`,employeeRoute)
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})
