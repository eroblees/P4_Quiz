const Sequelize = require('sequelize');

const {log, biglog, errorlog, colorize} = require("./out");

const {models} = require('./model');

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

const makeQuestion = (rl, text) => {
    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
            resolve(answer.trim());
        });
    });
}

exports.addCmd = rl =>{

    makeQuestion(rl, ' Introduzca una pregunta: ')
        .then(q => {
            return makeQuestion(rl, ' Introduzca la respuesta ')
                .then(a => {
                    return {question: q, answer: a};
                });
        })
        .then(quiz => {
            return models.quiz.create(quiz);
        })
        .then((quiz) => {
            log(`${colorize('Se ha añadido', "magenta")}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo: ');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
}

const validateId = id => {

    return new Sequelize.Promise ((resolve, reject) => {
        if (typeof id == "undefined"){
            reject(new Error(`Falta el parámetro <id>.`));
        } else {
            id = parseInt(id);
            if(Number.isNaN(id)){
                reject(new Error(`Falta el parámetro <id> no es un número.`));
            } else {
                resolve(id);
            }
        }
    });
}

exports.showCmd = (rl, id) =>{

    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz){
                throw new Error(`No existe un quiz asociado al id = ${id}.`);
            }
            log(`[${ colorize(quiz.id, "magenta")}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
}

exports.listCmd = rl =>{

    models.quiz.findAll()
        .each(quiz => {
            log(`[${ colorize(quiz.id, "magenta")}]: ${quiz.question}`);
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });

};

exports.testCmd = (rl, id) =>{

    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz){
                throw new Error(`No existe un quiz asociado al id = ${id}.`);
            }

            return makeQuestion(rl, colorize(`${quiz.question}? `, 'red'))
                .then(answer => {

                    if (answer.trim().toUpperCase() === quiz.answer.trim().toUpperCase()){
                        log("Su respuesta es correcta.");
                        biglog("Correcta", "green");
                    } else {
                        log("Su respuesta es incorrecta.");
                        biglog("Incorrecta", "red");
                    }
                });
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
}


/*
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
*/

exports.playCmd = rl => {

    let score = 0;
    let toBeResolved = []; //ids que quedan por preguntar
    let i = 0;
    models.quiz.findAll()
        .each(quiz => {
            //toBeResolved.push(quiz.question);
            toBeResolved.push(i);
            i++;
        })
        .then(() => {
            playOne();
        });

    const playOne = () => {
        if (toBeResolved.length === 0) { // Si no quedan preguntas por resolver
            log('No hay nada más que preguntar.');
            log(`Fin del juego. Aciertos: ${score}`);
            biglog(`${score}`, "magenta");
            rl.prompt();
        } else {
            let id = Math.round(Math.random() * (toBeResolved.length - 1)); //Obtengo un ID aleatorio de la pregunta
            let aux = toBeResolved[id];
            let id_bd = aux +1;
            toBeResolved.splice(id, 1); //Elimino ese id del array de preguntas que quedan


            validateId(id_bd)
                .then(id => models.quiz.findById(id_bd))
                .then(quiz => {
                    if (!quiz) {
                        throw new Error(`No existe un quiz asociado al id = ${id_bd}.`);
                    }

                    return makeQuestion(rl, colorize(`${quiz.question}? `, 'red'))
                        .then(answer => {

                            if (answer.trim().toUpperCase() === quiz.answer.trim().toUpperCase()) {
                                score++;
                                log(`CORRECTO - Lleva ${score} aciertos.`);
                                playOne();
                            } else {
                                log('INCORRECTO.');
                                log(`Fin del juego. Aciertos: ${score}`);
                                biglog(`${score}`, "magenta");
                                rl.prompt();
                            }
                        });
                })
                .catch(Sequelize.ValidationError, error => {
                    errorlog('El quiz es erroneo:');
                    error.errors.forEach(({message}) => errorlog(message));
                })
                .catch(error => {
                    errorlog(error.message);
                })
                .then(() => {
                    rl.prompt();
                });
        }
    }
}


/*
            const quiz = models.quiz.findById(id);

            rl.question(colorize(`${quiz.question}? `, 'red'), answer => {

                if (answer.trim().toUpperCase() === quiz.answer.trim().toUpperCase()){
                    score++;
                    log(`CORRECTO - Lleva ${score} aciertos.`);
                    playOne();
                } else {
                    log('INCORRECTO.');
                    log(`Fin del juego. Aciertos: ${score}`);
                    biglog(`${score}`, "magenta");
                    rl.prompt();
                }
            });
        }
    }
*/

exports.deleteCmd = (rl, id) =>{

    validateId(id)
        .then(id => models.quiz.destroy({where: {id}}))
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
}

exports.editCmd = (rl, id) =>{

    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz){
                throw new Error(`No existe un quiz asociado al id = ${id}.`);
            }

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
            return makeQuestion(rl, ' Introduzca una pregunta: ')
                .then(q => {
                    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
                    return makeQuestion(rl, ' Introduzca la respuesta ')
                        .then(a => {
                            quiz.question = q;
                            quiz.answer = a;
                            return quiz;
                        });
                });
        })
        .then(quiz => {
            return quiz.save();
        })
        .then(quiz => {
            log(` Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${answer}`)
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
}

exports.creditsCmd = rl =>{
    log('Autores de la práctica:', 'green');
    log('Eduardo Robles Unzueta', 'green');
    rl.prompt();
};

exports.quitCmd = rl =>{
    rl.close();
};
