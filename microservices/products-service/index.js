const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const PORT = 3002; // Puerto diferente para evitar conflictos con el monolito
const Product = require('./models/productsModels'); // Importamos el modelo de producto

app.use(express.json());

// Conexión a la base de datos MongoDB
mongoURL = process.env.DATABASE_URL;
mongoose.connect(mongoURL)
    .then(()=> console.log('Conectado a la base de datos MongoDB'))
    .catch(err=> console.error('Error al conectar a la base de datos MongoDB:', err));

app.get('/productos', async (req, res) => {
    try {
        const products = await Product.find(); // Obtenemos todos los productos desde la base de datos
        res.json(products);
    } catch (error){
        res.status(500).json({ message: 'Error al obtener los productos', error: error.message  });
    }
});

app.get('/productos/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id); // Buscamos el producto por ID
        if (!product) {
            res.status(404).json({ message: 'Producto no encontrado' });
        } res.json(product);
    } catch (error) {
        // Maneja el error si el ID no es válido para Mongoose
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de producto inválido' });
        }
        res.status(500).json({ message: 'Error al obtener el producto', error: error.message });    
    }
});

app.post('/productos', async (req, res)=>{
    try{
        const newProduct = new Product(req.body);
        const saveProduct = await newProduct.save();
        res.status(201).json(saveProduct);
    } catch(error){
        if(error.name === 'ValidationError'){
            return res.status(400).json({ message: 'Error de validación', error: error.message });
        }
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
})

app.put('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // La opción { new: true } devuelve el documento actualizado
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        res.json(updatedProduct);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de producto inválido' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Error de validación', error: error.message });
        }
        res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
});

app.delete('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        // No se devuelve contenido, solo un código de éxito
        res.status(204).send();
    
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de producto inválido' });
        }
        res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Microservicio de productos corriendo en http://localhost:${PORT}`);
})