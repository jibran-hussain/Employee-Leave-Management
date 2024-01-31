import { DataTypes } from 'sequelize';
import sequelize from '../../index.js'

const Employee= sequelize.define('Employee',{
        id:{
            type:DataTypes.INTEGER,
            allowNull:false,
            autoIncrement:true,
            primaryKey:true
        },
        name:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        email:{
            type:DataTypes.STRING,
            allowNull:false,
            unique:true
        },
        hashedPassword:{
            type:DataTypes.STRING,
            allowNull:false
        },
        mobileNumber:{
            type:DataTypes.BIGINT,
        },
        salary:{
            type:DataTypes.DOUBLE.UNSIGNED,
        },
        role:{
            type:DataTypes.STRING(10),
            allowNull:false
        },
        leavesLeft:{
            type:DataTypes.INTEGER,
            defaultValue:20
        }
    },{
        paranoid:true
    })


    export default Employee