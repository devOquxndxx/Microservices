const express = require('express');
const { sequelize } = require('./config/db');
const Ventas = require('./models/ventasModel');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// con esto obtenemos ventas por clienteID (usado por el microservicio de usuarios)
app.get('/ventasforCliente', async (req, res) => {
    const { clienteID } = req.query;

    try {
        if (!clienteID) {
            return res.status(400).json({ message: 'clienteID es requerido' });
        }

        const ventas = await Ventas.findAll({ 
            where: { clienteID: clienteID }
        });
        
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las ventas del cliente', error: error.message });
        console.error('Error al obtener las ventas del cliente:', error.message);
    }
});

// esta ruta la puse para probar
app.get('/', async (req, res) => {
    res.json({ message: 'Microservicio de Ventas funcionando correctamente' });
});

// ruta para ver las ventas 
app.get('/ventas', async (req, res) => {
    try {
        const ventas = await Ventas.findAll();
        res.json(ventas);
    } catch (error) {
        if (error.name === 'SequelizeDatabaseError') {
            return res.status(500).json({ message: 'Error de base de datos', error: error.message });
        }

        if (error.name === 'SequelizeConnectionError') {
            return res.status(500).json({ message: 'Error de conexión a la base de datos', error: error.message });
        }

        res.status(500).json({ message: 'Error al obtener las ventas', error: error.message });
    }
});

// ruta para ver una venta por el ID
app.get('/ventas/:id', async (req, res) => {
    try {
        const Venta = await Ventas.findByPk(req.params.id);
        if (!Venta) {
            return res.status(404).json({ message: 'Venta no encontrada', error: error.message });
        }
        res.json(Venta);
    } catch (error) {
        if (error.name === 'SequelizeDatabaseError') {
            return res.status(500).json({ message: 'Error de base de datos', error: error.message });
        }
        if (error.name === 'SequelizeConnectionError') {
            return res.status(500).json({ message: 'Error de conexión a la base de datos', error: error.message });
        }
        res.status(500).json({ message: 'Error al obtener la venta', error: error.message });
    }
});

// ruta para crear una venta
app.post('/ventas', async (req, res) => {
    try {
        const newVenta = await Ventas.create(req.body);
        res.status(201).json(newVenta);
    } catch(error){
        if(!req.body.fechaVenta || !req.body.clienteID || !req.body.totalVenta){
            return res.status(400).json({ message: 'Faltan campos obligatorios', error: error.message });
        }
    }
});

// ruta para actualizar una venta
app.put('/ventas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedVenta = await Ventas.findByPk(id);
        if(!updatedVenta){
            return res.status(404).json({ message: 'Venta no encontrada', error: error.message });
        }
        await updatedVenta.update(req.body);
        res.json(updatedVenta);
    } catch (error){
        if (error.name === 'SequelizeDatabaseError') {
            return res.status(500).json({ message: 'Error de base de datos', error: error.message });
        }
        if (error.name === 'SequelizeConnectionError') {
            return res.status(500).json({ message: 'Error de conexión a la base de datos', error: error.message });
        }
        res.status(500).json({ message: 'Error al actualizar la venta', error: error.message });
    }
});

// ruta para eliminar una venta
app.delete('/ventas/:id', async (req, res) => {
    try{
        const { id } = req.params;
        const deletedVenta = await Ventas.findByPk(id);
        if(!deletedVenta){
            return res.status(404).json({ message: 'Venta no encontrada', error: error.message });
        }
        await deletedVenta.destroy();
        res.json({ message: 'Venta eliminada correctamente' });
    } catch(error){
        if (error.name === 'SequelizeDatabaseError') {
            return res.status(500).json({ message: 'Error de base de datos', error: error.message });
        }
        if (error.name === 'SequelizeConnectionError') {
            return res.status(500).json({ message: 'Error de conexión a la base de datos', error: error.message });
        }
        res.status(500).json({ message: 'Error al eliminar la venta', error: error.message });
    }
});

app.listen(PORT, async() =>{
    console.log(`Servidor de Ventas corriendo en http://localhost:${PORT}`);
    try{
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida exitosamente.');
        await sequelize.sync({ alter: true }); // Sincroniza los modelos con la base de datos
        console.log('Modelos sincronizados con la base de datos.');
    } catch(error){
        console.error('No se pudo conectar a la base de datos:', error);
    }
} )

