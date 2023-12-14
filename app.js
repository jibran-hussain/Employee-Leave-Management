import express from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import 'dotenv/config';

import employeeRoute from './src/routes/employee.js'


const app=express();

const PORT=process.env.port || 8000


app.use('/api',employeeRoute)
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})