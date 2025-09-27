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

app.get('/:id/ventas', async (req, res) => {
    const clienteID = req.params.id;
    try {
        // const { isValidObjectId } = require('mongoose');

        // if (!isValidObjectId(clienteID)) {
        //     return res.status(400).json({ mensaje: 'Formato de ID inválido' });
        // }

        // buscamos el cliente en mongo
        const cliente = await User.findById(clienteID);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        const ventasResponse = await ventasService.get(`/ventasforCliente`, { params: { clienteID } })

        const historialVentas = ventasResponse.data;

        // Si no hay ventas, devolvemos un mensaje adecuado
        if (historialVentas.length === 0) {
            return res.json({ message: 'No hay ventas para este cliente', ventas: [] });
        }

        // combinamos los datos y devolvemos la respuesta
        res.json({
            cliente,
            ventas: historialVentas
        });

    } catch (error) {
        console.error('Error al obtener el historial de ventas:', error.message);
        res.status(500).json({ message: 'Error al obtener el historial de ventas', error: error.message });
    }
})



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