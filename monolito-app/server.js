const express = require('express');
const app = express();
const PORT = 3000;


app.use(express.json());

let users = [
    {id: 1, nombre: "Juan"},
    {id: 2, nombre: "Ana"}
];

// ruta para manejar solicitudes GET
app.get('/users', (req, res) => {
    res.json(users);
});

// ruta para manejar solicitudes POST
app.post('/users', (req, res) => {
    const newUser = req.body;
    newUser.id = users.length + 1;
    users.push(newUser);
    res.status(201).json(newUser);
});

let products = [
    {id: 1, nombre: "Producto A", precio: 100},
    {id: 2, nombre: "Producto B", precio: 200}
]

// ruta para manejar solicitudes GET de productos
app.get('/products', (req, res) => {
    res.json(products);
});

// ruta para manejar solicitudes POST de productos
app.post('/products', (req, res) => {
    const newProduct = req.body;
    newProduct.id = products.length + 1;
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// iniciar el servidor
app.listen(PORT, () => {
    console.log(`Monolito corriendo en http://localhost:${PORT}`);
}); 

