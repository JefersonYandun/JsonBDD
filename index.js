const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

const dataFilePath = path.join(__dirname, 'datos.json'); // Cambiado de 'data.json' a 'datos.json'

// Helper function to read data from JSON file
const readData = () => {
    try {
        const rawData = fs.readFileSync(dataFilePath);
        return JSON.parse(rawData);
    } catch (error) {
        console.error("Error reading data file:", error);
        return [];
    }
};

// Helper function to write data to JSON file
const writeData = (data) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing to data file:", error);
    }
};

// Handle all methods with app.all
app.all('/persona', (req, res) => {
    let persona = readData();

    switch (req.method) {
        case 'GET':
            res.json(persona);
            break;

        case 'POST':
            const { description, completed } = req.query;
            if (!description || completed === undefined) {
                return res.status(400).json({ error: 'Description and completed status are required' });
            }
            const newTask = {
                id: persona.length ? persona[persona.length - 1].id + 1 : 1,
                description,
                completed: completed === 'true'
            };
            persona.push(newTask);
            writeData(persona);
            res.status(201).json(newTask);
            break;

        case 'PUT':
            const idToUpdate = parseInt(req.query.id, 10);
            const taskIndex = persona.findIndex(task => task.id === idToUpdate);

            if (taskIndex === -1) {
                return res.status(404).json({ error: 'Task not found' });
            }

            if (req.query.description !== undefined) {
                persona[taskIndex].description = req.query.description;
            }
            if (req.query.completed !== undefined) {
                persona[taskIndex].completed = req.query.completed === 'true';
            }

            writeData(persona);
            res.json(persona[taskIndex]);
            break;

        case 'DELETE':
            const idToDelete = parseInt(req.query.id, 10);
            persona = persona.filter(task => task.id !== idToDelete);
            writeData(persona);
            res.status(204).send();
            break;

        default:
            res.status(405).send({ error: 'Method not allowed' });
    }
});



// Iniciar el servidor
app.listen(3000, () => { // Utiliza `app` para iniciar el servidor
    console.log("El servidor está ejecutándose en el puerto 3000");
});