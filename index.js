
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

const dataFilePath = path.join(__dirname, 'data.json');

// Helper function to read data from JSON file
const readData = () => {
    const rawData = fs.readFileSync(dataFilePath);
    return JSON.parse(rawData);
};

// Helper function to write data to JSON file
const writeData = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// Handle all methods with app.all
app.all('/tasks', (req, res) => {
    let tasks = readData();

    switch (req.method) {
        case 'GET':
            res.json(tasks);
            break;

        case 'POST':
            const { description, completed } = req.query;
            if (!description || completed === undefined) {
                return res.status(400).json({ error: 'Description and completed status are required' });
            }
            const newTask = {
                id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
                description,
                completed: completed === 'true'
            };
            tasks.push(newTask);
            writeData(tasks);
            res.status(201).json(newTask);
            break;

        case 'PUT':
            const idToUpdate = parseInt(req.query.id, 10);
            const taskIndex = tasks.findIndex(task => task.id === idToUpdate);

            if (taskIndex === -1) {
                return res.status(404).json({ error: 'Task not found' });
            }

            if (req.query.description !== undefined) {
                tasks[taskIndex].description = req.query.description;
            }
            if (req.query.completed !== undefined) {
                tasks[taskIndex].completed = req.query.completed === 'true';
            }

            writeData(tasks);
            res.json(tasks[taskIndex]);
            break;

        case 'DELETE':
            const idToDelete = parseInt(req.query.id, 10);
            tasks = tasks.filter(task => task.id !== idToDelete);
            writeData(tasks);
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