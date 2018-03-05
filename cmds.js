

const {log, biglog, errorlog, colorize} = require("./out");

const model = require('./model');

exports.helpCmd = rl => {
    log("Comandos:");
    log("h|help - Muestra esta ayuda.");
    log("list - Listar los quizzes existentes.");
    log("show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log("add - Añadir un nuevo quiz interactivamente.");
    log("delete <id> - Borrar el quiz indicado.");
    log("edit <id> - Editar el quiz indicado.");
    log("test <id> - Probar el quiz indicado.");
    log("p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log("credits - Créditos.");
    log("q|quit - Salir del programa.");
    rl.prompt();
};

exports.addCmd = rl =>{

    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

        rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {

            model.add(question, answer);
            log(`${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
            rl.prompt();
        });
    });
};

exports.showCmd = (rl, id) =>{

    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    } else{
        try{
            const quiz = model.getByIndex(id);
            log(`[${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        } catch(error){
            errorlog(error.message);
        }
    }

    rl.prompt();
};

exports.listCmd = rl =>{

    model.getAll().forEach((quiz, id) => {

        log(`[${ colorize(id, "magenta")}]: ${quiz.question}`);

    });
    rl.prompt();
};

exports.testCmd = (rl, id) =>{
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else{
        try{

            const quiz = model.getByIndex(id);

            rl.question(colorize(`${quiz.question}? `, 'red'), answer => {

                if (answer.trim().toUpperCase() === quiz.answer.trim().toUpperCase()){
                    log("Su respuesta es correcta.");
                    biglog("Correcta", "green");
                } else {
                    log("Su respuesta es incorrecta.");
                    biglog("Incorrecta", "red");
                }
                rl. prompt();
            });
        } catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};

exports.playCmd = rl =>{

    let score = 0;
    let toBeResolved = []; //ids que quedan por preguntar
    for(let i=0; i<model.count(); ++i){
        toBeResolved.push(i);
    }

    const playOne = () =>{
        if(toBeResolved.length === 0){ // Si no quedan preguntas por resolver
            log('No hay nada más que preguntar.');
            log('Fin del examen. Aciertos:');
            biglog(`${score}`, "magenta");
            rl.prompt();
        }else{
            let id = Math.round(Math.random() * (model.count()-1)); //Obtengo un ID aleatorio de la pregunta
            toBeResolved.splice(id, 1); //Elimino ese id del array de preguntas que quedan

            const quiz = model.getByIndex(id);

            rl.question(colorize(`${quiz.question}? `, 'red'), answer => {

                if (answer.trim().toUpperCase() === quiz.answer.trim().toUpperCase()){
                    score++;
                    log(`CORRECTO - Lleva ${score} aciertos`);
                } else {
                    log('INCORRECTO.');
                    log('Fin del examen. Aciertos:');
                    biglog(`${score}`, "magenta");
                }
                rl.prompt();
            });

            playOne();
            rl.prompt();

        }
    }

    playOne();

}

exports.deleteCmd = (rl, id) =>{

    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    } else{
        try{
            model.deleteByIndex(id);
        } catch(error){
            errorlog(error.message);
        }
    }

    rl.prompt();
};

exports.editCmd = (rl, id) =>{

    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else{
        try{

            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

                rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(`Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        } catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};

exports.creditsCmd = rl =>{
    log('Autores de la práctica:', 'green');
    log('Eduardo Robles Unzueta', 'green');
    rl.prompt();
};

exports.quitCmd = rl =>{
    rl.close();
};
