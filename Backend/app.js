import express from 'express';
import 'dotenv/config';
import authRoute from './src/routes/auth.js'
import employeeRoute from './src/routes/employee.js'
import leaveRoute from './src/routes/leaves.js'
import {connectToDB} from './db/connection.js'
const app=express();
const PORT=process.env.port || 8000

app.use(connectToDB)
app.use(express.json())
app.use(`/api/${process.env.API_VERSION}/auth`,authRoute)
app.use(`/api/${process.env.API_VERSION}`,employeeRoute)
app.use(`/api/${process.env.API_VERSION}`,leaveRoute)


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})