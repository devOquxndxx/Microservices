const express = require('express');
const app = express();
const PORT = 3001; // Puerto diferente para evitar conflictos con el microservicio de productos
const mongoose = require('mongoose');
require('dotenv').config(); // Cargar variables de entorno desde el archivo .env
const User = require('./models/userModels');
const axios = require('axios');

app.use(express.json());


const PRODUCTOS_URL = process.env.URL_PRODUCTOS;
const VENTAS_URL = process.env.VENTAS_URL;


const ventasService = axios.create({
    baseURL: VENTAS_URL,
    timeout: 5000,
})

app.get('/clientes/:cliendeID/ventas', async (req, res) => {
    const { clienteID } = req.params;
    try {
        const cliente = await User.findOne({ clienteID: parseInt(clienteID, 10) }).lean();
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        const response = await axios.get(`${VENTAS_URL}/ventas`, {
            params: { clienteID: clienteID },
        });

        const ventas = Array.isArray(response.data) ? response.data : response.data.ventas || [];

        res.json({
            cliente,
            historialVentas: ventas
        });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'No hay ventas registradas para este cliente' });
        }
        console.error('Error:', error.message);
        return res.status(500).json({ message: 'Error interno', error: error.message });
    }

});




mongoURL = process.env.DATABASE_URL;
mongoose.connect(mongoURL)
    .then(() => console.log('Conectado a la base de datos MongoDB'))
    .catch(err => console.error('Error al conectar a la base de datos MongoDB:', err));

app.get('/usuarios', async (req, res) => {
    try {
        const Users = await User.find();
        res.json(Users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
    }
});

app.get('/usuarios/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de usuario inválido' });
        }
    }
});

app.post('/usuarios', async (req, res) => {
    try {
        const newUser = new User(req.body);
        const saveUser = await newUser.save();
        res.status(201).json(saveUser);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Error de validación', error: error.message });
        }
        res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
    }
});

app.put('/usuarios/id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateUser = await User.findOneAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updateUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(updateUser);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Error de validación', error: error.message });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de usuario inválido' });
        }
        res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
    }
});

app.delete('/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteUser = await User.findByIdAndDelete(id);
        if (!deleteUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de usuario inválido' });
        }
        res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
    }
})

app.listen(PORT, () => {
    console.log(`Microservicio de usuarios corriendo en http://localhost:${PORT}`);
})