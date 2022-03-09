//Conexion a base de datos
const controller = {};

let amqp = require('amqplib/callback_api');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const moment = require('moment')

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
            if (element.toString() === 'TFT\\TFT.DEL.PAGES_Extrusion' || element.toString() === 'TFT\\TFT.DEL.PAGES_BTS_CapturaProduccion' || element.toString() === 'TFT\\TFT.DEL.PAGES_BTS_CambioProduccion') {
                acceso.push(element.toString())
            }
        });
        let response = acceso.length == 0 ? reject("noAccess") : resolve(acceso)
    })

}

controller.mainMenu_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('main_menu.ejs', {
        user_id,
        user_name
    })
}

controller.userAccess_POST = (req, res) => {
    let user_id = req.body.user
    funcion.getUsers(user_id)
        .then((result) => {
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
            console.error(err);
            res.json(err)
        })
}





function accessToken(user_id, user_name) {
    return new Promise((resolve, reject) => {
        const id = { id: `${user_id}`, username: `${user_name}` }
        jwt.sign({ id }, `tristone`, {/*expiresIn: '1h'*/}, (err, token) => {
            resolve(token)
            reject(err)
        })
    })
}


function cookieSet(req, res, result) {

    let minutes = 15;
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
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('backflushEx.ejs', {
        user_id,
        user_name
    })
}

controller.consultaEx_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('consultaEx.ejs', {
        user_id,
        user_name
    })
}


controller.getTurnos_POST = (req, res) => {
    let day = req.body.day

    funcion.getTurnos()
        .then((result) => {

            if (day == 5) {
                result.splice(0, 1)
                result.splice(2, 1)
            } else {
                result.splice(1, 1)
                result.splice(3, 1)
            }

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

const arreglosExcel = (numeros_sap, bufferExcel) => {
    return new Promise((resolve, reject) => {

        let numeros_actuales = numeros_sap.map(({ no_sap }) => no_sap)

        let arreglo = [];
        let titulos = [];
        let titulos2 = [];
        let valores = [];

        let count = 0;

        const wb = new Excel.Workbook();


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
                    if (!numeros_actuales.includes(arreglo[i][0])) reject("Verificar numeros SAP")

                }

            })
            .then(() => {
                for (let i = 0; i < titulos2.length; i++) {
                    if ((titulos2[i]).toLowerCase().includes("numero_sap") || (titulos2[i]).toLowerCase().includes("cantidad") || (titulos2[i]).toLowerCase().includes("linea")) {
                        count++
                    }
                }
                if (3 == count) {

                    resolve([titulos, valores])
                } else {
                    reject("Verificar archivo de Excel")
                }
            })
    })
}

controller.verificarSAP_POST = (req, res) => {
    let body = JSON.parse(req.body.data)

    let fecha = body.fecha
    let turno = body.turno

    let user = (req.res.socket.user).substring(4)
    let bufferExcel = req.file.buffer

    async function waitForPromise() {
        let numeros_sap = await funcion.getNumerosSAP()
        let excel = await arreglosExcel(numeros_sap, bufferExcel)


        Promise.all([numeros_sap, excel])
            .catch(err => { res.json(err) })
            .then(result => {
                numeros_sap_ = result[0]

                titulos = result[1][0]
                valores = result[1][1]
                funcion.insertProgramaExcel("production_plan", titulos, valores, user.toLowerCase(), fecha, turno)
                    .then((result) => { res.json(result) })
                    .catch((err) => { res.json(err) })

            })


    }
    waitForPromise()

        .catch((err) => { res.status(200).send({ message: err }) })
}





controller.cargaProgramacion_GET = (req, res) => {
    user = req.connection.user
    let access = ""
    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_Extrusion") access = "ok"
            });
            if (access == "ok") {
                res.render("cargaProgramacion.ejs", { user })
            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })
}






function amqpRequest(data) {
    return new Promise((resolve, reject) => {
        let send = data
        let args = process.argv.slice(2);
        let estacion = data.station
        if (args.length == 0) {
            // console.info("Usage: rpc_client.js num");
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
                    let correlationId = estacion;
                    console.info(' [x] Requesting: ', send);

                    channel.consume(q.queue, function (msg) {
                        if (msg.properties.correlationId == correlationId) {
                            console.info(' [x] Response:   ', msg.content.toString());
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
    fecha = req.params.fecha
    let access = ""
    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_Extrusion") access = "ok"
            });
            if (access == "ok") {
                res.render("editarProgramacion.ejs", { user, fecha })
            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })

}


controller.inventario_GET = (req, res) => {

    user = req.connection.user
    fecha = req.params.fecha
    let access = ""
    res.render("inventario.ejs", { user, fecha })
    // acceso(req)
    //     .then((result) => {
    //         result.forEach(element => {
    //             if (element === "TFT\\TFT.DEL.PAGES_Extrusion" || element === "TFT\\TFT.DEL.PAGES_Extrusion_Green") access = "ok"
    //         });
    //         if (access == "ok") {
    //             res.render("inventario.ejs", { user, fecha })
    //         } else {
    //             res.redirect("/acceso_denegado")
    //         }
    //     })
    //     .catch((err) => { res.redirect("/acceso_denegado") })

}


controller.tablaProgramacion_POST = (req, res) => {

    let fecha = req.body.fecha
    funcion.getProgramacionFecha(fecha)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })

}


controller.getInventario_POST = (req, res) => {

    funcion.getInventario(fecha)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })

}


controller.cancelarIdPlan_POST = (req, res) => {

    let midplan = req.body.id
    let motivo = req.body.motivo

    funcion.cancelarIdPlan(midplan, motivo)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })


}

controller.impresion_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    let todayDate = moment()

    let start_midnight = moment("00:00:00", 'HH:mm:ss')
    let end_midnight = moment("00:59:59", 'HH:mm:ss')
    let timeNow = moment();
    let currentShift
    async function waitForPromise() {
        let getTurnos = await funcion.getTurnosAll()

        if (moment().weekday() === 6) {
            getTurnos.splice(0, 1)
            getTurnos.splice(2, 1)
        } else {
            getTurnos.splice(1, 1)
            getTurnos.splice(3, 1)
        }


        getTurnos.forEach(element => {

            let start = moment(element.turno_inicio, 'HH:mm:ss')
            let end = moment(element.turno_final, 'HH:mm:ss')

            if (end.isBetween(start_midnight, end_midnight)) {

                if (timeNow.isBetween(start_midnight, end)) {

                    start.subtract(1, "days")
                    todayDate.subtract(1, "days")
                }
                end.add(1, "days")

            }


            if (timeNow.isBetween(start, end)) {

                currentShift = (element.turno_descripcion).substring(0, 2);           
            }
        });

        todayDate = todayDate.format("YYYY-MM-DD")

        funcion.getProgramacionTurno(todayDate, currentShift)
            .then((result) => {
                turnos = result
                res.render('impresion.ejs', {
                    user_id,
                    user_name,
                    turnos,
                    currentShift
                })
            })
            .catch((err) => {
                console.error(err);
            })
    }
    waitForPromise()


}

controller.getCurrentProgramacion_POST = (req, res) => {

    fecha = req.body.fecha
    turno = req.body.turno
    linea = req.body.linea
    funcion.getCurrentProgramacion(fecha, turno, linea)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => { res.json(err) })
}


controller.idplanInfo_POST = (req, res) => {

    let idplan = req.body.id

    funcion.getInfoIdPlan(idplan)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })


}

controller.editarIdPlan_POST = (req, res) => {

    let midplan = req.body.id
    let cantidad = req.body.cantidad
    let linea = req.body.linea
    funcion.editarIdPlan(midplan, cantidad, linea)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })


}

controller.agregarIdPlan_POST = (req, res) => {

    let numero_sap = req.body.sap
    let cantidad = req.body.cantidad
    let linea = req.body.linea
    let sup_name = (req.res.socket.user).substring(3)
    let fecha = req.body.fecha
    let turno = req.body.turno
    funcion.agregarIdPlan(numero_sap, cantidad, linea, sup_name, fecha, turno)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })


}

controller.idplanImpresion_POST = (req, res) => {

    let idplan = req.body.id

    async function waitForPromise() {
        let planImpresion = await funcion.getPlanImpresion(idplan);
        let etiquetasImpresas = await funcion.etiquetasPlan(idplan);
        Promise.all([planImpresion, etiquetasImpresas])
            .then(result => { res.json(result) })
            .catch(err => { console.error(err) })
    }
    waitForPromise()



}

controller.impresion_POST = (req, res) => {
    let plan_id = req.body.plan_id
    let no_sap = req.body.no_sap
    let operador_id = req.res.locals.authData.id.id
    let operador_name = req.res.locals.authData.id.username
    let cantidad = parseInt(req.body.cantidad)
    let contenedor = req.body.contenedor
    let capacidad = parseInt(req.body.capacidad)
    let etiquetas = parseInt(req.body.etiquetas)
    let linea = req.body.linea
    let tipo = req.body.tipo
    let serial_num
    let impresoType = req.body.impresoType


    async function waitForPromise() {
        let process = "handling_ext"
        let send = `{"plan_id":${plan_id},"serial_num":"","process":"${process}", "material":"${no_sap}",  "cantidad":${capacidad}, "numero_etiquetas":${etiquetas}, "station": "${linea}","impresoType":"${impresoType}","operator_name":"${operador_name}", "operator_id":${operador_id}}`
        
        amqpRequest(send)
            .then(result => {
                res.json(result)
            })
            .catch(err => {
                console.error(err);
            })

    }
    waitForPromise()
}





controller.checkSap_POST = (req, res) => {

    let sap = req.body.sap

    funcion.checkSap(sap)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })

}


controller.etiquetasImpresas_GET = (req, res) => {

    user = req.connection.user
    let access = ""
    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_Extrusion") access = "ok"
            });
            if (access == "ok") {
                res.render("etiquetasImpresas.ejs", { user })
            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })

}


controller.tablaSeriales_POST = (req, res) => {

    let fecha = req.body.fecha
    funcion.getSerialesFecha(fecha)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })

}

controller.tablaSerialesFechasMultiples_POST = (req, res) => {

    let desde = req.body.desde
    let hasta = req.body.hasta
    funcion.getSerialesFechasMultiples(desde, hasta)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })

}

controller.tablaPlanFechasMultiples_POST = (req, res) => {

    let desde = req.body.desde
    let hasta = req.body.hasta
    funcion.getPlanFechasMultiples(desde, hasta)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })

}


controller.cancelarSeriales_POST = (req, res) => {

    let seriales = req.body.seriales
    let motivo = req.body.motivo
    let arraySeriales = seriales.split(',')
    let tipo = req.body.tipo
    let user
    if (tipo == "retorno") {
        user = req.body.user
    } else {
        user = (req.connection.user).substring(3)
    }


    funcion.cancelarSeriales(arraySeriales, motivo, user)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })
}

controller.cancelarSerialesRetorno_POST = (req, res) => {

    let seriales = req.body.seriales
    let motivo = req.body.motivo
    let arraySeriales = seriales.split(',')
    let estacion = uuidv4();
    let process = "transfer_ext_rp"
    let user_id = req.res.locals.authData.id.id
    let tipo = req.body.tipo
    let user
    if (tipo == "retorno") {
        user = req.body.user
    } else {
        user = (req.connection.user).substring(3)
    }


    funcion.cancelarSeriales(arraySeriales, motivo, user)
        .then((result) => { })
        .catch((err) => { console.error(err) })


    async function getStatus() {

        let info = await infoSeriales(arraySeriales)
        let jsonInfo = JSON.stringify(info)

        let send = `{"station":"${estacion}","serial_num":"","process":"${process}", "material":"",  "cantidad":"", "user_id": "${user_id}","data":${jsonInfo}}`

        amqpRequest(send)
            .then((result) => {
                async function updateAcred() {
                    let resultado = JSON.parse(result)
                    res.json(result)
                }
                updateAcred()

            })
            .catch((err) => { console.error(err) })
    }
    getStatus()

}



controller.getIdPlans_POST = (req, res) => {

    let fecha = req.body.fecha

    async function waitForPromise() {

        let getIdPlansFecha = await funcion.getIdPlans(fecha)
        let getCountCanceled = await funcion.getCountCanceled(fecha)

        Promise.all([getIdPlansFecha, getCountCanceled])
            .then((result) => {

                ids = result[0]
                canceled_acreditado = result[1]

                for (let i = 0; i < ids.length; i++) {

                    for (let y = 0; y < canceled_acreditado.length; y++) {

                        if (ids[i].plan_id == canceled_acreditado[y].plan_id) {
                            ids.splice(i, 1)
                        }

                    }

                }

            }).then(() => {
                res.json({ ids })
            })

    }

    waitForPromise()


}

controller.cancelarSerialesPlan_POST = (req, res) => {

    let plan_id = req.body.id
    let motivo = req.body.motivo
    let user = (req.connection.user).substring(3)

    funcion.cancelSerialesPlan(plan_id, motivo, user)
        .then((result) => { res.json(result) })
        .catch((err) => { console.error(err) })


}


controller.procesarSeriales_POST = (req, res) => {

    let seriales = req.body.seriales
    let arraySeriales = seriales.split(',')
    let estacion = uuidv4();
    let process = "confirm_ext_hu"
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username

    async function getStatus() {

        let allStatus = await statusSeriales(arraySeriales)
        let checkStatus = await checkAllStatus(allStatus, "Impreso")

        if (checkStatus.length > 0) {

            let obj = {}
            obj['result'] = checkStatus
            obj['error'] = "N/A"
            res.json(JSON.stringify(obj))

        } else {


            let info = await infoSeriales(arraySeriales)
            let jsonInfo = JSON.stringify(info)
            let send = `{"station":"${estacion}","serial_num":"","process":"${process}", "material":"",  "cantidad":"", "user_id":"${user_id}", "data":${jsonInfo}}`
            amqpRequest(send)
                .then((result) => {
                    async function updateAcred() {
                        let resultado = JSON.parse(result)
                        let resultadArray = resultado.result
                        // let acreditado = await updateAcreditado(resultadArray, user_id);
                        res.json(result)
                    } updateAcred()
                })
                .catch((err) => { console.error(err) })

        }
    }
    getStatus()

}


controller.consultarSeriales_POST = (req, res) => {

    let seriales = req.body.seriales
    let arraySeriales = seriales.split(',')
    async function getStatusInfo() {
        let allStatus = await statusSeriales(arraySeriales)
        res.json(allStatus)
    }
    getStatusInfo()

}

function statusSeriales(seriales) {
    return new Promise((resolve, reject) => {
        funcion.statusSerial(seriales)
            .then((result) => {
                resolve(result)
            })
            .catch((err) => { reject(err) })
    })
}

function infoSeriales(seriales) {
    return new Promise((resolve, reject) => {
        funcion.infoSerial(seriales)
            .then((result) => {
                resolve(result)
            })
            .catch((err) => { reject(err) })
    })
}

function checkAllStatus(seriales, status) {
    return new Promise((resolve, reject) => {
        let noAcreditar = []
        seriales.forEach(element => {

            if (status === "Impreso") {
                if (element.status != status) {
                    let obj = {}
                    let error
                    if (element.status === "Cancelado") error = "Serial Cancelado"
                    if (element.status === "Acreditado") error = "Serial Previamente Acreditado"
                    if (element.status === "No Encontrado") error = "Serial No Encontrado"
                    if (element.status === "Transferido") error = "Serial Acreditado y Transferido"
                    if (element.status === "Obsoleto") error = "Serial Obsoleto"
                    if (element.status === "Error") error = "Serial con Error"
                    if (element.status === "Impreso_re") error = "Serial sin retornar, destruir etiqueta"
                    if (element.status === "Retornado") error = "Serial retornado no es posible su acreditacion"
                    obj['serial_num'] = element.serial
                    obj['error'] = error
                    obj['result'] = "N/A"
                    noAcreditar.push(obj)
                }
            }
            if (status === "Acreditado") {

                let todayDate = moment()
                let serialDate = (moment(element.datetime))

                let hours = todayDate.diff(serialDate, 'hours')


                if (hours < 12 && element.status == "Acreditado") {

                    let obj = {}
                    obj['serial'] = element.serial
                    obj['error'] = "Serial en Reposo Menor a 12 Horas"
                    obj['result'] = "N/A"
                    noAcreditar.push(obj)

                } else {

                    if (element.status != status && element.status != "Retornado") {
                        let obj = {}
                        let error
                        if (element.status === "Cancelado") error = "Serial Cancelado"
                        if (element.status === "Impreso") error = "Serial Sin Acreditar"
                        if (element.status === "No Encontrado") error = "Serial No Encontrado"
                        if (element.status === "Obsoleto") error = "Serial Obsoleto"
                        if (element.status === "Transferido") error = "Serial previamente transferido"
                        if (element.status === "Error") error = "Serial con Error"
                        if (element.status === "Impreso_re") error = "Serial sin retornar, destruir etiqueta"
                        obj['serial'] = element.serial
                        obj['error'] = error
                        obj['result'] = "N/A"
                        noAcreditar.push(obj)
                    }

                }


            }


            if (status === "Transferido") {

                if (element.status != status) {
                    let obj = {}
                    let error
                    if (element.status === "Cancelado") error = "Serial Cancelado"
                    if (element.status === "Impreso") error = "Serial Sin Acreditar"
                    if (element.status === "No Encontrado") error = "Serial No Encontrado"
                    if (element.status === "Acreditado") error = "Serial Acreditado"
                    if (element.status === "Obsoleto") error = "Serial Obsoleto"
                    if (element.status === "Error") error = "Serial con Error"
                    if (element.status === "Retornado") error = "Serial previamente retornado"
                    if (element.status === "Impreso_re") error = "Serial sin retornar, destruir etiqueta"
                    obj['serial_num'] = element.serial
                    obj['error'] = error
                    noAcreditar.push(obj)
                }
            }



        });
        resolve(noAcreditar)
    })
}

function updateAcreditado(seriales, user_id) {
    return new Promise((resolve, reject) => {
        funcion.updateSerialesAcred(seriales, user_id)
            .then((result) => {
                resolve(result)
            })
            .catch((err) => { reject(err) })
    })
}

function updateTransferido(seriales, user_id, status) {
    return new Promise((resolve, reject) => {
        funcion.updateSerialesTransferidos(seriales, user_id, status)
            .then((result) => {
                resolve(result)
            })
            .catch((err) => { reject(err) })
    })
}

function updateTransferidoPR(serial, user_id, status) {
    return new Promise((resolve, reject) => {
        funcion.updateSerialesTransferidosPR(serial, user_id, status)
            .then((result) => {
                resolve(result)
            })
            .catch((err) => { reject(err) })
    })
}


controller.reportes_GET = (req, res) => {

    res.render('reportes.ejs', {

    });
}

controller.reporteGrafico_POST = (req, res) => {
    desde = req.body.desde
    hasta = req.body.hasta
    funcion.graficaReporte(desde, hasta)
        .then(result => { res.json(result) })
        .catch(err => { console.error(err) })
}

controller.transferRP_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('transferRP.ejs', {
        user_id,
        user_name
    })
}

controller.transferPR_GET = (req, res) => {
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username
    res.render('transferPR.ejs', {
        user_id,
        user_name
    })
}

controller.transferenciaRP_POST = (req, res) => {

    let seriales = req.body.seriales
    let arraySeriales = seriales.split(',')
    let estacion = uuidv4();
    let process = "transfer_ext_rp"
    let user_id = req.res.locals.authData.id.id
    let user_name = req.res.locals.authData.id.username

    async function getStatus() {

        let allStatus = await statusSeriales(arraySeriales)
        let checkStatus = await checkAllStatus(allStatus, "Acreditado")

        if (checkStatus.length > 0) {

            let obj = {}
            obj['result'] = checkStatus
            obj['error'] = "N/A"
            res.json(JSON.stringify(obj))

        } else {


            let info = await infoSeriales(arraySeriales)
            let jsonInfo = JSON.stringify(info)

            let send = `{"station":"${estacion}","serial_num":"","process":"${process}", "material":"",  "cantidad":"", "user_id": "${user_id}","data":${jsonInfo}}`

            amqpRequest(send)
                .then((result) => {
                    async function updateAcred() {
                        let resultado = JSON.parse(result)
                        res.json(result)
                    }
                    updateAcred()

                })
                .catch((err) => { console.error(err) })
        }
    }
    getStatus()

}


controller.getAllInfoSerial_POST = (req, res) => {

    let serial = req.body.serial
    let arraySeriales = serial.split(',')

    async function getStatus() {

        let allStatus = await statusSeriales(arraySeriales)
        let checkStatus = await checkAllStatus(allStatus, "Transferido")

        if (checkStatus.length == 0) {

            funcion.getAllInfoSerial(serial)
                .then(result => { res.json(result) })
                .catch(err => { console.error(err) })

        } else {
            res.json(checkStatus)
        }
    }
    getStatus()
}

controller.getAllInfoMaterial_POST = (req, res) => {

    let material = req.body.material




    funcion.getAllInfoMaterial(material)
        .then(result => { res.json(result) })
        .catch(err => { console.error(err) })


}

controller.verifyProcessBEx_POST = (req, res) => {

    let serial = req.body.seriales
    let arraySeriales = serial.split(',')

    async function getStatus() {

        funcion.countSeriales(arraySeriales)
            .then(result => { res.json(result) })
            .catch(err => { console.error(err) })


    }
    getStatus()
}


controller.impresionPR_POST = (req, res) => {
    let plan_id = req.body.plan_id
    let no_sap = req.body.no_sap
    let operador_id = req.res.locals.authData.id.id
    let operador_name = req.res.locals.authData.id.username
    let cantidad = parseInt(req.body.cantidad)
    let contenedor = req.body.contenedor
    let capacidad = parseInt(req.body.capacidad)
    let etiquetas = parseInt(req.body.etiquetas)
    let linea = req.body.linea
    let tipo = req.body.tipo
    let serial_num = req.body.serial_num
    let impresoType = req.body.impresoType




    async function waitForPromise() {

        let process = "storage_unit_ext_pr"
        let send = `{"plan_id":${plan_id},"serial_num":"${serial_num}","process":"${process}", "material":"${no_sap}",  "cantidad":${capacidad}, "numero_etiquetas":${etiquetas}, "station": "${linea}","impresoType":"${impresoType}","operator_name":"${operador_name}", "operator_id":"${operador_id}"}`
        amqpRequest(send)
            .then(result => {
                res.json(result)
            })
            .catch(err => {
                console.error(err);
            })

    }
    waitForPromise()
}

controller.confirmacionPR_POST = (req, res) => {

    let serial = req.body.serial
    let serial_obsoleto = (req.body.serial_obsoleto).substring(1)
    let type = serial_obsoleto.charAt(0)


    async function getStatus() {

        let user_id = req.body.user
        let acreditado = await updateTransferidoPR(serial, user_id, "Retornado");
        if (type === "S" || type === "s") {
            funcion.updateObsoleto(serial_obsoleto)
                .then((result) => { })
                .catch((err) => { console.error(err) })
            res.json()
        } else {
            res.json()
        }

    }
    getStatus()
}


module.exports = controller;