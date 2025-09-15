const mongoose = require('mongoose');

// definimos el esquema de los productos
const productSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true, // Validación: el nombre es obligatorio
        trim: true     // Elimina espacios en blanco al inicio y final
    },
    precio: {
        type: Number,
        required: true, // Validación: el precio es obligatorio
        min: 0          // Validación: el precio debe ser un número positivo
    }
}, {
    timestamps: true, // Añade campos `createdAt` y `updatedAt` automáticamente
    collection: "productos" // Nombre de la colección en MongoDB
})

// creamos el modelo de producto
const Product = mongoose.model('Product', productSchema);

module.exports = Product;