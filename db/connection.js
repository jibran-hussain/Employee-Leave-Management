import sequelize from '../index.js'
import Employee from "../src/models/employee.js";

export const connectToDB=async()=>{
    try{
        await sequelize.authenticate();
        await Employee.sync();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}