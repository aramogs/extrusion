//Conexion a base de datos
const controller = {};

let amqp = require('amqplib/callback_api');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const moment = require('moment')
const axios = require('axios')
//Require Funciones
const funcion = require('../public/js/functions/controllerFunctions');

//Require ExcelJs
const Excel = require('exceljs');
const { resolveInclude } = require('ejs');




controller.index_GET = (req, res) => {
    user = req.connection.user
    res.render('index.ejs', {
        user
    });
}

controller.login = (req, res) => {
    section = req.params.id
    res.render('login.ejs', {
        section
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
    console.log(req.body);
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
            console.error(err);
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
    console.log(req.body);
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
        .then((result) => {
            titulos = result[0]
            valores = result[1]
            //TODO cambiar base y tabla a .env
            //TODO Crear funcion extra que verifique que los numeros de SAP coiniciden con la base da datos, en caso contrario regresar error
            funcion.insertProgramaExcel("extrusion", "production_plan", titulos, valores, user, fecha, turno)
                .then((result) => { res.json(result) })
                .catch((err) => { res.json(err) })
        })
        .catch((err) => { console.error(err) })

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






function amqpRequest(data) {
    return new Promise((resolve, reject) => {
        let send = data
        let args = process.argv.slice(2);
        let estacion= data.station
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
                    let correlationId = estacion;
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
    fecha = req.params.fecha
    let access = ""
    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_BTS_CargaProduccion") access = "ok"
            });
            if (access == "ok") {
                res.render("editarProgramacion.ejs", { user,fecha })
            } else {
                res.redirect("/acceso_denegado")
            }
        })
        .catch((err) => { res.redirect("/acceso_denegado") })

}


controller.tablaProgramacion_POST = (req, res) => {

    let fecha = req.body.fecha
    funcion.getProgramacionFecha(fecha)
        .then((result) => { res.json(result) })
        .catch((err) => { console.log(err) })

}


controller.cancelarIdPlan_POST = (req, res) => {

    let midplan = req.body.id
    let motivo = req.body.motivo
    funcion.cancelarIdPlan(midplan, motivo)
        .then((result) => { res.json(result) })
        .catch((err) => { console.log(err) })


}

controller.impresion_GET = (req, res) => {
    user_id = req.res.locals.authData.id.id
    user_name = req.res.locals.authData.id.username
    let todayDate = moment().format("YYYY-MM-DD")

    async function waitForPromise() {
        let getTurnos = await funcion.getTurnosAll()

        getTurnos.forEach(element => {
            let start = moment(element.turno_inicio, 'HH:mm:ss')
            if (moment(start, 'HH:mm:ss') <= moment()) {
                currentShift = (element.turno_descripcion).substring(0, 2);
            }
        });

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
        .catch((err) => { console.log(err) })


}

controller.editarIdPlan_POST = (req, res) => {

    let midplan = req.body.id
    let cantidad = req.body.cantidad
    let linea = req.body.linea
    funcion.editarIdPlan(midplan, cantidad, linea)
        .then((result) => { res.json(result) })
        .catch((err) => { console.log(err) })


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
        .catch((err) => { console.log(err) })


}


controller.idplanImpresion_POST = (req, res) => {

    let idplan = req.body.id

    funcion.getPlanImpresion(idplan)
        .then((result) => { res.json(result) })
        .catch((err) => { console.log(err) })


}

controller.impresion_POST = (req, res) => {

    let plan_id = req.body.plan_id
    let no_sap = req.body.no_sap
    let operador_id = req.res.locals.authData.id.id
    let cantidad = req.body.cantidad
    let contenedor = req.body.contenedor
    let capacidad = req.body.capacidad
    let linea = req.body.linea



    numero_etiquetas = Math.floor(cantidad / capacidad)


    async function waitForPromise() {

        let insert = await funcion.insertImpresion(plan_id, no_sap, operador_id, capacidad, numero_etiquetas);
        let values = await funcion.getBaseExtr(no_sap)
        let impre = await funcion.getPrinter(linea)
        let data = {}
        let serial_num = insert.insertId + numero_etiquetas -1
        Promise.all([insert, values, impre])
            .then((result) => {

                inserted = result[0]
                values_ = result[1]
                impresora = result[2][0].printer

                for (let i = 0; i < numero_etiquetas; i++) {
                    let serial = inserted.insertId++
                    printLabel(i, serial)
                }

                function printLabel(i,serial) {
                    setTimeout(() => {
                        for (const [key, value] of Object.entries(values_[0])) {

                            if (`${key}` === `${contenedor}`) data['quant'] = value
                            data[`${key}`] = value  
                            data[`printer`] = impresora
                            data['serial'] = serial
                            data['line'] = linea
                            data['emp_num'] = operador_id
    
                        }
    
                        axios({
                            method: 'post',
                            url: `http://${process.env.BARTENDER_SERVER}:${process.env.BARTENDER_PORT}/Integration/EXT/Execute/`,
                            data: JSON.stringify(data),
                            headers: { 'content-type': 'application/json' }
                        })
                    }, 1000* i);
                }
                
            })
            .then(()=>{
                res.json({"last_id":serial_num})
                funcion.UpdatePlan(plan_id)
            })
    }

    
    waitForPromise()


}


controller.checkSap_POST = (req, res) => {

    let sap= req.body.sap

    funcion.checkSap(sap)
    .then((result)=>{res.json(result)})
    .catch((err)=>{console.error(err)})

}


controller.etiquetasImpresas_GET = (req, res) => {

    user = req.connection.user
    let access = ""
    acceso(req)
        .then((result) => {
            result.forEach(element => {
                if (element === "TFT\\TFT.DEL.PAGES_BTS_CargaProduccion") access = "ok"
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
    
    let fecha= req.body.fecha
    funcion.getSerialesFecha(fecha)
    .then((result)=>{res.json(result)})
    .catch((err)=>{console.log(err)})

}


controller.cancelarSeriales_POST = (req, res) => {

    let seriales=req.body.seriales
    let motivo= req.body.motivo
    let arraySeriales=seriales.split(',')
    funcion.cancelarSeriales(arraySeriales, motivo)
    .then((result)=>{res.json(result)})
    .catch((err)=>{console.log(err)})


}


controller.getIdPlans_POST = (req, res) => {

    let fecha= req.body.fecha

    async function waitForPromise() {

        let getIdPlansFecha= await funcion.getIdPlans(fecha)
        let getCountCanceled= await funcion.getCountCanceled(fecha)

        Promise.all([getIdPlansFecha,getCountCanceled])
        .then((result) => {

            ids = result[0]
            canceled_acreditado= result[1]

            for (let i = 0; i < ids.length; i++) {

               for (let y = 0; y < canceled_acreditado.length; y++) {
                   
                    if(ids[i].plan_id==canceled_acreditado[y].plan_id){
                        ids.splice(i,1)
                    }
                   
               }
                
            }

        }).then(()=>{
            res.json({ids})
        })

    }

    waitForPromise()
    

}

controller.cancelarSerialesPlan_POST = (req, res) => {

    let plan_id=req.body.id
    let motivo=req.body.motivo

    funcion.cancelSerialesPlan(plan_id, motivo)
    .then((result)=>{res.json(result)})
    .catch((err)=>{console.log(err)})


}


controller.procesarSeriales_POST = (req, res) => {

    let seriales=req.body.seriales
    let arraySeriales=seriales.split(',')
    let estacion = uuidv4();
    let process="confirm_ext_hu"
   
    async function getStatus(){

        let allStatus=await statusSeriales(arraySeriales)
        let checkStatus = await checkAllStatus(allStatus)

        if(checkStatus.length>0){

            let obj ={}
            obj['result']=checkStatus
            obj['error']="N/A"
            console.log(JSON.stringify(obj))
            res.json(JSON.stringify(obj))

        }else{

            let info = await infoSeriales(arraySeriales)  
<<<<<<< HEAD
            // Send Acreditar agrupado por numero de parte
            // const sumPartes = async (array, all = {}) => (
            //     array.forEach(({ numero_parte, cantidad }) => (all[numero_parte] = (all[numero_parte] ?? 0) + cantidad)), all
            //   )
            //   let sendAcreditar= await sumPartes(info);

            console.log(info)
              let send = `{"station":"${estacion}","serial_num":"","process":"${process}", "material":"",  "cantidad":"", "data":${JSON.stringify(info)}}`
              amqpRequest(send)
              .then((result)=>{
                async function updateAcred(){
                //   let acreditado = await updateAcreditado(arraySeriales);
                //   console.log(acreditado)
=======
            let jsonInfo=JSON.stringify(info)
              let send = `{"station":"${estacion}","serial_num":"","process":"${process}", "material":"",  "cantidad":"", "data":${jsonInfo}}`
              amqpRequest(send)
              .then((result)=>{
                async function updateAcred(){
                    let resultado= JSON.parse(result)
                    let resultadArray= resultado.result
                    let acreditado = await updateAcreditado(resultadArray);
                    console.log(result)
>>>>>>> 4422d123546270594906e6de0f74b62b710b9542
                  res.json(result)
                }updateAcred()
                })
              .catch((err)=>{console.error(err)})

        }
    }
    getStatus()

}

controller.consultarSeriales_POST = (req, res) => {

    let seriales=req.body.seriales
    let arraySeriales=seriales.split(',')
    async function getStatusInfo(){
        let allStatus=await statusSeriales(arraySeriales)
        res.json(allStatus)
    }
    getStatusInfo()

}

function statusSeriales(seriales) {
    return new Promise((resolve, reject) => {
        funcion.statusSerial(seriales) 
        .then((result)=>{
            resolve(result)
        })
        .catch((err)=>{reject(err)})
    })     
}
     
function infoSeriales(seriales) {
    return new Promise((resolve, reject) => {
        funcion.infoSerial(seriales) 
        .then((result)=>{
            resolve(result)
        })
        .catch((err)=>{reject(err)})
    })     
}

function checkAllStatus(seriales) {
    return new Promise((resolve, reject) => {
        let noAcreditar=[]
        seriales.forEach(serial => {

            if(serial.status != "Impreso"){
                let obj ={}
                let error
                if(serial.status=="Cancelado")error="Serial Cancelado"
                if(serial.status=="Acreditado")error="Serial Ya Acreditado"
                if(serial.status=="No Encontrado")error="Serial No Encontrado"
                obj['serial_num']=serial.serial
                obj['error']=error
                obj['result']="N/A"
                noAcreditar.push(obj)
            }
            
        });
        resolve(noAcreditar)
    })     
}

function updateAcreditado(seriales) {
    return new Promise((resolve, reject) => {
        funcion.updateSerialesAcred(seriales) 
        .then((result)=>{
            resolve(result)
        })
        .catch((err)=>{reject(err)})
    })     
}




module.exports = controller;