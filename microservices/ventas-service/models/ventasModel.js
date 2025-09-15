const { DataTypes } = require('sequelize');
const  {sequelize}  = require('../config/db');

const Ventas = sequelize.define('Ventas', {
    ventaID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    clienteID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    totalVenta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },

}, {
    timestamps: true,
    tableName: 'ventas', // Nombre de la tabla en la base de datos
    createdAt: "fechaVenta",
    updatedAt: "fechaActualizacion"
    
});

module.exports = Ventas;