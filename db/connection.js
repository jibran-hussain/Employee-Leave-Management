import sequelize from '../index.js'
import Employee from "../src/models/employee.js";
import Leave from '../src/models/leaves.js';

export const connectToDB=async()=>{
    try{
        await sequelize.authenticate();
        // has to many association
        Employee.hasMany(Leave,{foreignKey:"employeeId"})
        Leave.belongsTo(Employee,{foreignKey:"employeeId"})
        await Employee.sync();
        await Leave.sync();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}