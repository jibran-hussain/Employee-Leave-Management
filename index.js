import { Sequelize } from "sequelize";

const sequelize=new Sequelize('employee_leave_management_system', 'postgres', 'postgres',{
    host:'localhost',
    dialect:'postgres'
})

export default sequelize;