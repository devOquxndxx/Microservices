const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    clienteID: {
        type: Number,
        required: true,
        unique: true,
        trim: true,
    },

    nombreCliente: {
        type: String,
        required: true,
        trim: true,
    },

    apellidoCliente: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,

    },

    Telefono: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },

    direccion: {
        type: String,
        required: true,
        trim: true,

    }
}, {

    timestamps: true,
    collection: "usuarios" // Nombre de la colección en MongoDB


})

const User = mongoose.model('User', userSchema);

module.exports = User;