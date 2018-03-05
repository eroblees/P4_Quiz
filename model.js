const fs = require('fs');

const DB_FILENAME = 'quizzes.json';

let quizzes = [
    {
        question: "Capital de Italia",
        answer: "Roma"
    },
    {
        question: "Capital de Francia",
        answer: "París"
    },
    {
        question: "Capital de España",
        answer: "Madrid"
    },
    {
        question: "Capital de Portugal",
        answer: "Lisboa"
    }
];

// Cargar preguntas del fichero en el array quizzes
const load = () => {

    fs.readFile(DB_FILENAME, (err, data) => {
        if(err){

            //La primera vez no hay fichero
            if(err.code === "ENOENT"){
                save(); //valores iniciales
                return;
            }
            throw err;
        }

        let json = JSON.parse(data);

        if (json){
            quizzes = json;
        }
    });
}

const save = () => {

    fs.writeFile(DB_FILENAME,
        JSON.stringify(quizzes),
        err => {
            if(err) throw err;
        });
}


// Métodos para los datos

// Número de preguntas
exports.count = () => quizzes.length;

// Añadir una pregunta + respuesta
exports.add = (question, answer) => {
    quizzes.push({
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};

// Actualizar una pregunta en una posición
exports.update = (id, question, answer) => {
    const quiz = quizzes[id];
    if (typeof quiz == "undefined"){
        throw new Error(`El valor del parámetro id no es válido.`);
    }
    quizzes.splice(id, 1, {
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};

// Mostrar preguntas actuales.
exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

// Mostrar la pregunta de la posición dada

exports.getByIndex = id => {
    const quiz = quizzes[id];
    if (typeof quiz == "undefined"){
        throw new Error(`El valor del parámetro id no es válido.`);
    }
    return JSON.parse(JSON.stringify(quiz));
};

// Eliminar quiz de la posición dada
exports.deleteByIndex = id => {
    const quiz = quizzes[id];
    if (typeof quiz == "undefined"){
        throw new Error(`El valor del parámetro id no es válido.`);
    }
    quizzes.splice(id, 1);
    save();
};

// Cargo los quizzes del fichero
load();