const express = require('express');
const fs = require('fs'); //para manejar archivos
const path = require('path'); // para trabajar con rutas de archivos y directorios
const app = express();
const port = 3000;

// express analice json
app.use(express.json());

// ruta archivo json
const dataFilePath = path.join(__dirname, 'datos.json'); 

const leerDatos = () => {
    try {
        const rawData = fs.readFileSync(dataFilePath);
        return JSON.parse(rawData);
    } catch (error) {
        console.error("Error al leer el archivo:", error);
        return [];
    }
};

const escribirDatos = (data) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error al escribir datos en el archivo:", error);
    }
};

app.all('/persona', (req, res) => {
    let personas = leerDatos();

    switch (req.method) {
        case 'GET':
            res.json(personas);
            break;

        case 'POST':
            //URL: http://localhost:3000/persona?nombre=Juan&edad=25&materia=Matemáticas&descripcion=Estudiante aplicado
            
            // Extrae los parámetros de consulta de la URL
            const { nombre, edad, materia, descripcion } = req.query;
            if (!nombre || !edad || !materia || !descripcion) {

                return res.status(400).json({ error: 'Se requiere nombre, edad, materia y descripción' });
            }
            const newPersona = {
                id: personas.length ? personas[personas.length - 1].id + 1 : 1,
                nombre,
                edad,
                materia,
                descripcion
            };
            personas.push(newPersona);
            escribirDatos(personas);
            res.status(201).json(newPersona);
            break;

        case 'PUT':
           // URL: http://localhost:3000/persona?id=1&nombre=Juan&edad=26&materia=Física&descripcion=Estudiante avanzado

            // Obtiene el ID de la persona a actualizar desde los parámetros de consulta
            const idToUpdate = parseInt(req.query.id, 10);
            // la encuentra en el array uwu
            const personaIndex = personas.findIndex(persona => persona.id === idToUpdate);

            if (personaIndex === -1) {
                return res.status(404).json({ error: 'Persona no encontrada' });
            }
            //actualiza cmapos de las personas de la bdd
            if (req.query.nombre !== undefined) {
                personas[personaIndex].nombre = req.query.nombre;
            }
            if (req.query.edad !== undefined) {
                personas[personaIndex].edad = req.query.edad;
            }
            if (req.query.materia !== undefined) {
                personas[personaIndex].materia = req.query.materia;
            }
            if (req.query.descripcion !== undefined) {
                personas[personaIndex].descripcion = req.query.descripcion;
            }

            escribirDatos(personas);
            res.json(personas[personaIndex]);
            break;

        case 'DELETE':
            const idToDelete = parseInt(req.query.id, 10);
         // Filtra el id 
            personas = personas.filter(persona => persona.id !== idToDelete);
            escribirDatos(personas);
            res.status(204).send();
            break;

        default:
            res.status(405).send({ error: 'Método no permitido' });
    }
});


// Iniciar el servidor
app.listen(3000, () => { 
    console.log("El servidor está ejecutándose en el puerto 3000");
});