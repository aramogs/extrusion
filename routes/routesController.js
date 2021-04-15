//Conexion a base de datos
const controller = {};

var amqp = require('amqplib/callback_api');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

//Require Funciones
const funcion = require('../public/js/functions/controllerFunctions');

//Require ExcelJs
const Excel = require('exceljs');



controller.index_GET = (req, res) => {
    user = req.connection.user
    res.render('index.ejs', {
        user
    });
}

controller.login = (req, res) => {
    res.render('login.ejs', {
    });
}

controller.accesoDenegado_GET = (req, res) => {
    console.log(req.connection);
    user = req.connection.user
    res.render('acceso_denegado.ejs', {
        user
    });
}

function acceso(req) {
    let acceso = []
    let userGroups = req.connection.userGroups

    return new Promise((resolve, reject) => {
        userGroups.forEach(element => {
            if (element.toString() === 'TFT\\TFT.DEL.PAGES_BTS_CargaProduccion' || element.toString() === 'TFT\\TFT.DEL.PAGES_BTS_CapturaProduccion' || element.toString() === 'TFT\\TFT.DEL.PAGES_BTS_CambioProduccion') {
                acceso.push(element.toString())
            }
        });
        let response = acceso.length == 0 ? reject("noAccess") : resolve(acceso)
    })

}

controller.mainMenu_GET = (req, res) => {

    user_id = req.res.locals.authData.id.id
    user_name = req.res.locals.authData.id.username
    res.render('main_menu.ejs', {
        user_id,
        user_name
    })
}

controller.userAccess_POST = (req, res) => {
    let user_id = req.body.user
    funcion.getUsers(user_id)
        .then((result) => {
            console.log(result);
            if (result.length == 1) {
                emp_nombre = result[0].emp_name

                accessToken(user_id, emp_nombre)
                    .then((result) => {
                        cookieSet(req, res, result)
                    })
                    .catch((err) => { res.json(err); })

            } else {
                res.json("unathorized")
            }
        })
        .catch((err) => {
            console.log(err);
            res.json(err)
        })
}





function accessToken(user_id, user_name) {
    return new Promise((resolve, reject) => {
        const id = { id: `${user_id}`, username: `${user_name}` }
        jwt.sign({ id }, `tristone`, { expiresIn: '1h' }, (err, token) => {
            resolve(token)
            reject(err)
        })
    })
}


function cookieSet(req, res, result) {

    let minutes = 60;
    const time = minutes * 60 * 1000;

    res.cookie('accessToken', result,
        {
            maxAge: time,
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production' ? true : false
        })
    res.json(result)

}


controller.backflushEx_GET = (req, res) => {
    user_id = req.res.locals.authData.id.id
    user_name = req.res.locals.authData.id.username
    res.render('backflushEx.ejs', {
        user_id,
        user_name
    })
}

controller.consultaEx_GET = (req, res) => {
    user_id = req.res.locals.authData.id.id
    user_name = req.res.locals.authData.id.username
    res.render('consultaEx.ejs', {
        user_id,
        user_name
    })
}

controller.getTurnos_GET = (req, res) => {
    funcion.getTurnos()
        .then((result) => {

            res.json(result)
        })
        .catch((err) => { res.json(err) })

}

controller.getProgramacion_POST = (req, res) => {
    let fecha = req.body.fecha
    funcion.getProgramacion(fecha)
        .then((result) => {

            res.json(result)
        })
        .catch((err) => { res.json(err) })

}

const arreglosExcel = (base, tabla, bufferExcel) => {
    return new Promise((resolve, reject) => {

        let arreglo = [];
        let titulos = [];
        let titulos2 = [];
        let valores = [];

        let count = 0;

        const wb = new Excel.Workbook();

        funcion.verifySAP(base, tabla, (err, numeros_sap) => {


            wb.xlsx.load(bufferExcel)
                .then(() => {
                    worksheet = wb.worksheets[0]
                    worksheet.eachRow(function (row, rowNumber) {
                        val = row.values
                        for (let i = 0; i < val.length; i++) {
                            if (val[i] === undefined) {
                                val[i] = " "
                            }
                        }
                        arreglo.push(val)
                    });
                })
                .then(() => {
                    for (let i = 0; i < arreglo.length; i++) {
                        arreglo[i].shift()
                    }
                    for (let i = 0; i < arreglo[0].length; i++) {
                        titulos.push(`\`${arreglo[0][i]}\``)
                        titulos2.push((arreglo[0][i]).toLowerCase())
                    }
                    for (let i = 1; i < arreglo.length; i++) {
                        

                        valores.push(arreglo[i])
         
                    }

                })
                .then(() => {
                    for (let i = 0; i < titulos2.length; i++) {
                        if (titulos2[i].includes("numero_sap") || titulos2[i].includes("cantidad")) {
                            count++
                        }
                    }
                    if (2 == count) {
                   
                        resolve([titulos, valores])
                    } else {
                        reject("Verificar archivo de Excel")
                    }
                })

        })
    })
}

controller.verificarSAP_POST = (req, res) => {
    console.log(req.body);
    let body = JSON.parse(req.body.data)
    
    let fecha = body.fecha
    let turno = body.turno

    let user = (req.res.socket.user).substring(3)
    let bufferExcel = req.file.buffer
    let base = process.env.DB_CONN_EXTR
    let tabla = "extr"
    
    arreglosExcel(base, tabla, bufferExcel)
    .then((result)=>{
        titulos = result[0]
        valores= result[1]
        //TODO cambiar base y tabla a .env
        //TODO Crear funcion extra que verifique que los numeros de SAP coiniciden con la base da datos, en caso contrario regresar error
        funcion.insertProgramaExcel("extrusion","production_plan",titulos,valores,user,fecha,turno)
        .then((result)=>{res.json(result)})
        .catch((err)=>{res.json(err)})
    })
    .catch((err)=>{console.error(err)})

}





controller.cargaProgramacion_GET = (req, res) => {
    user = req.connection.user
    let access = ""
    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_BTS_CargaProduccion") access = "ok"
            });
            if (access == "ok") {
                res.render("cargaProgramacion.ejs", { user })
            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })
}






function amqpRequest(estacion, serial, proceso, material, material_description, storage_bin, cantidad, cantidad_restante, user_id, lower_gr_date, single_container) {
    return new Promise((resolve, reject) => {
        let send = `{"station":"${estacion}","serial_num":"${serial}","process":"${proceso}", "material": "${material}", "material_description": "${material_description}","storage_bin": "${storage_bin}", "cantidad":"${cantidad}", "cantidad_restante":"${cantidad_restante}", "user_id":${user_id},"lower_gr_date":"${lower_gr_date}","single_container":"${single_container}"}`

        var args = process.argv.slice(2);
        if (args.length == 0) {
            // console.log("Usage: rpc_client.js num");
            // process.exit(1);
        }

        amqp.connect(`amqp://${process.env.RMQ_USER}:${process.env.RMQ_PASS}@${process.env.RMQ_SERVER}`, function (error0, connection) {
            if (error0) {
                // throw error0;
                reject(error0)
            }
            connection.createChannel(function (error1, channel) {
                if (error1) {
                    // throw error1;
                    reject(error1)
                }
                channel.assertQueue('', {
                    exclusive: true
                }, function (error2, q) {
                    if (error2) {
                        // throw error2;
                        reject(error2)
                    }
                    var correlationId = estacion;
                    console.log(' [x] Requesting: ', send);

                    channel.consume(q.queue, function (msg) {
                        if (msg.properties.correlationId == correlationId) {
                            console.log(' [x] Response:   ', msg.content.toString());
                            resolve(msg.content.toString())
                            setTimeout(function () {
                                connection.close();
                                // process.exit(0)
                            }, 500);

                        }
                    }, {
                        noAck: true
                    });

                    channel.sendToQueue('rpc_queue',
                        Buffer.from(send.toString()), {
                        correlationId: correlationId,
                        replyTo: q.queue
                    });
                });
            });
        });
    })
}


controller.editarProgramacion_GET = (req, res) => {

    user = req.connection.user
    let access = ""
    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_BTS_CargaProduccion") access = "ok"
            });
            if (access == "ok") {
                res.render("editarProgramacion.ejs", { user })
            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })

}


controller.tablaProgramacion_GET = (req, res) => {
    let fecha= req.params.fecha


    funcion.getProgramacion(fecha)
    .then((result)=>{res.json(result)})
    .catch((err)=>{console.log(err)})

}



module.exports = controller;