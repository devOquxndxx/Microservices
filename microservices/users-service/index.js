const express = require('express');
const app = express();
const PORT = 3001; // Puerto diferente para evitar conflictos con el microservicio de productos
const mongoose = require('mongoose');
require('dotenv').config(); // Con esto podemos cargar variables de entorno desde el archivo .env
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

        // buscamos el cliente en mongo
        const cliente = await User.findById(clienteID);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        const ventasResponse = await ventasService.get(`/ventasforCliente`, { params: { clienteID } })

        const historialVentas = ventasResponse.data;

        //  devolvemos un mensaje adecuad si no hay ventas
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




// Listar todos los usuarios
app.get('/usuarios', async (req, res) => {
    try {
        const Users = await User.find();
        res.json(Users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
    }
});

// Obtener un usuario específico por ID
app.get('/usuarios/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de usuario inválido' });
        }
        res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
    }
});


// Obtener historial de ventas de un cliente específico
app.get('/:id/ventas', async (req, res) => {
    const clienteID = req.params.id;
    try {
        // Buscamos el cliente en MongoDB
        const cliente = await User.findById(clienteID);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        // Llamamos al microservicio de ventas usando el clienteID del usuario
        const ventasResponse = await ventasService.get(`/ventasforCliente`, { 
            params: { clienteID: cliente.clienteID } // Usamos el clienteID del modelo de usuario
        });

        const historialVentas = ventasResponse.data;

        // Si no hay ventas, devolvemos un mensaje adecuado
        if (historialVentas.length === 0) {
            return res.json({ 
                message: 'No hay ventas para este cliente', 
                cliente: {
                    id: cliente._id,
                    clienteID: cliente.clienteID,
                    nombre: `${cliente.nombreCliente} ${cliente.apellidoCliente}`,
                    email: cliente.email
                },
                ventas: [] 
            });
        }

        // Combinamos los datos y devolvemos la respuesta
        res.json({
            cliente: {
                id: cliente._id,
                clienteID: cliente.clienteID,
                nombre: `${cliente.nombreCliente} ${cliente.apellidoCliente}`,
                email: cliente.email,
                telefono: cliente.Telefono,
                direccion: cliente.direccion
            },
            ventas: historialVentas,
            totalVentas: historialVentas.length,
            montoTotal: historialVentas.reduce((total, venta) => total + parseFloat(venta.totalVenta), 0)
        });

    } catch (error) {
        console.error('Error al obtener el historial de ventas:', error.message);
        if (error.response) {
            // Error del microservicio de ventas
            return res.status(error.response.status).json({ 
                message: 'Error al comunicarse con el servicio de ventas', 
                error: error.response.data 
            });
        }
        res.status(500).json({ message: 'Error al obtener el historial de ventas', error: error.message });
    }
});

// Listar todos los clientes con sus resúmenes de ventas
app.get('/clientes/con-historial', async (req, res) => {
    try {
        const clientes = await User.find();
        const clientesConHistorial = [];

        for (const cliente of clientes) {
            try {
                const ventasResponse = await ventasService.get(`/ventasforCliente`, { 
                    params: { clienteID: cliente.clienteID }
                });
                
                const ventas = ventasResponse.data;
                const totalVentas = ventas.length;
                const montoTotal = ventas.reduce((total, venta) => total + parseFloat(venta.totalVenta), 0);

                clientesConHistorial.push({
                    id: cliente._id,
                    clienteID: cliente.clienteID,
                    nombre: `${cliente.nombreCliente} ${cliente.apellidoCliente}`,
                    email: cliente.email,
                    telefono: cliente.Telefono,
                    resumenVentas: {
                        totalVentas,
                        montoTotal: montoTotal.toFixed(2),
                        ultimaVenta: ventas.length > 0 ? ventas[ventas.length - 1].fechaVenta : null
                    }
                });
            } catch (ventaError) {
                // Si hay error al obtener ventas, agregamos el cliente sin historial
                clientesConHistorial.push({
                    id: cliente._id,
                    clienteID: cliente.clienteID,
                    nombre: `${cliente.nombreCliente} ${cliente.apellidoCliente}`,
                    email: cliente.email,
                    telefono: cliente.Telefono,
                    resumenVentas: {
                        totalVentas: 0,
                        montoTotal: "0.00",
                        ultimaVenta: null,
                        error: "No se pudo obtener historial de ventas"
                    }
                });
            }
        }

        res.json({
            totalClientes: clientesConHistorial.length,
            clientes: clientesConHistorial
        });

    } catch (error) {
        console.error('Error al obtener clientes con historial:', error.message);
        res.status(500).json({ message: 'Error al obtener clientes con historial', error: error.message });
    }
});


// Crear un nuevo usuario
app.post('/usuarios', async (req, res) => {
    try {
        const newUser = new User(req.body);
        const saveUser = await newUser.save();
        res.status(201).json(saveUser);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Error de validación', error: error.message });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Usuario ya existe (email o clienteID duplicado)' });
        }
        res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
    }
});

// Actualizar un usuario
app.put('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateUser = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
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
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email o clienteID ya existe' });
        }
        res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
    }
});

// Eliminar un usuario
app.delete('/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteUser = await User.findByIdAndDelete(id);
        if (!deleteUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado correctamente', usuario: deleteUser });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de usuario inválido' });
        }
        res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
    }
});


mongoURL = process.env.DATABASE_URL;
mongoose.connect(mongoURL)
    .then(() => console.log('Conectado a la base de datos MongoDB'))
    .catch(err => console.error('Error al conectar a la base de datos MongoDB:', err));

app.listen(PORT, () => {
    console.log(`Microservicio de usuarios corriendo en http://localhost:${PORT}`);
});