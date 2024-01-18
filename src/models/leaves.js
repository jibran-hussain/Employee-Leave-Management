import { DataTypes } from 'sequelize';
import sequelize from '../../index.js';

const Leave=sequelize.define('Leave',{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    reason:{
        type:DataTypes.STRING,
        allowNull:false
    },
    dates:{
        type:DataTypes.ARRAY(DataTypes.DATEONLY),
        allowNull:false
    }
},{
    paranoid:true
})

export default Leave;