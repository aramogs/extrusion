const funcion = {};

const db = require('../../db/conn_b10_bartender');
const dbE = require('../../db/conn_empleados');
const dbEX = require('../../db/conn_extr');
const dbA = require('../../db/conn_areas');



funcion.getUsers = (user) => {
    return new Promise((resolve, reject) => {
        dbE(`
        SELECT 
            emp_name
        FROM
            empleados
        WHERE
            emp_num = ${user}
        AND 
            emp_area = "EX"
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getTurnos = () => {
    return new Promise((resolve, reject) => {
        dbA(`
        SELECT 
            turno_descripcion
        FROM
            turnos
        ORDER BY
            turno_descripcion
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getTurnosAll = () => {
    return new Promise((resolve, reject) => {
        dbA(`
        SELECT
            *
        FROM
            turnos
        ORDER BY
            turno_descripcion`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })

}

funcion.getProgramacion = (fecha) => {
    return new Promise((resolve, reject) => {
        dbEX(`
        SELECT DISTINCT
            turno
        FROM
            production_plan
        WHERE
            fecha = '${fecha}'
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getNumerosSAP = () => {
    return new Promise((resolve, reject) => {
        db(`
        SELECT no_sap FROM extr;
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error)   })
    })


}

funcion.insertProgramaExcel = (tabla, titulos, valores, sup_num, fecha, turno) => {
    return new Promise((resolve, reject) => {
        let valor
        let valores_finales = []
        let arreglo_arreglos = []
  

        for (let i = 0; i < valores.length; i++) {
            valores_finales = []
            for (let y = 0; y < titulos.length; y++) {

                if (typeof (valores[i][y]) === "string") {
                    valor = `${valores[i][y]}`
                } else if (typeof (valores[i][y])) {
                    valor = valores[i][y]
                }
                valores_finales.push(valor)

            }
            valores_finales.push(`${sup_num}`)
            valores_finales.push(`${fecha}`)
            valores_finales.push(`${turno}`)

            arreglo_arreglos.push(valores_finales)
        }

        let sql  = `INSERT INTO ${tabla} (${titulos.join()},sup_name,fecha,turno) VALUES ?`;
        
        dbEX(sql, [arreglo_arreglos])
        .then((result) => {
            resolve(result.affectedRows)

        })
        .catch((error) => { console.error(error); reject(error) })

    })

}


funcion.getProgramacionFecha = (fecha) => {
    return new Promise((resolve, reject) => {
        dbEX(`
        SELECT 
            *
        FROM
            production_plan
        WHERE
            fecha = '${fecha}'
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getCurrentProgramacion = (fecha, turno, linea) => {
    return new Promise((resolve, reject) => {
        dbEX(`
        SELECT 
            s1.*, s2.impreso
        FROM
            (SELECT * FROM production_plan, b10_bartender.extr WHERE DATE(production_plan.fecha) = '${fecha}' AND turno = '${turno}' AND linea = '${linea}' AND numero_sap = no_sap) AS s1
        LEFT JOIN
            (SELECT numero_parte, SUM(cantidad) AS 'impreso', plan_id FROM extrusion_labels WHERE DATE(extrusion_labels.datetime) = '${fecha}' AND extrusion_labels.status != 'Cancelado' GROUP BY plan_id) AS s2 
        ON s1.plan_id = s2.plan_id
            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.cancelarIdPlan = (idplan, motivo) => {

    return new Promise((resolve, reject) => {
        dbEX(`
        UPDATE 
            production_plan
        SET
            status = 'Cancelado', 
            motivo_cancel ='${motivo}'

        WHERE
            plan_id= ${idplan}
        
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getInfoIdPlan = (idplan) => {
    return new Promise((resolve, reject) => {
        dbEX(`
        SELECT 
            *
        FROM
            production_plan
            
        WHERE
            plan_id = ${idplan}
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.editarIdPlan = (idplan, cantidad, linea) => {
    return new Promise((resolve, reject) => {
        dbEX(`
        UPDATE 
            production_plan
        SET
            cantidad = ${cantidad}, 
            linea =${linea}
        WHERE
            plan_id= ${idplan}
            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getPlanImpresion = (idplan) => {
    return new Promise((resolve, reject) => {
        dbEX(`
        SELECT 
            *
        FROM
            extrusion.production_plan,
            b10_bartender.extr
        WHERE
            extrusion.production_plan.plan_id = ${idplan}
        AND 
            extrusion.production_plan.numero_sap = b10_bartender.extr.no_sap;


        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.etiquetasPlan = (idplan) => {
    return new Promise((resolve, reject) => {
        dbEX(`
        SELECT 
             SUM(cantidad) as impreso
        FROM
            extrusion.extrusion_labels
        WHERE
            plan_id = ${idplan}
        AND status != "Cancelado";
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.agregarIdPlan = (numero_sap, cantidad, linea, sup_name, fecha, turno) => {

    return new Promise((resolve, reject) => {
        dbEX(`
        INSERT INTO 
            production_plan (numero_sap,cantidad,linea,sup_name, fecha, turno)
        VALUES
            ('${numero_sap}',${cantidad},${linea},'${sup_name}','${fecha}','${turno}')
            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getProgramacionTurno = (fecha, turno) => {
    return new Promise((resolve, reject) => {
        dbEX(`
        SELECT 
        DISTINCT
            (linea)
        FROM
            production_plan
        WHERE
            fecha = '${fecha}'
        AND 
            turno = '${turno}'
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.checkSap = (sap) => {
    return new Promise((resolve, reject) => {
        db(`
        SELECT 
            *
        FROM
            extr
            
        WHERE
            no_sap = '${sap}'
            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getBaseExtr = (no_sap) => {
    return new Promise((resolve, reject) => {
        db(`
        SELECT
            *
        FROM
            extr
        WHERE
            no_sap = '${no_sap}'
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}



funcion.getSerialesFecha = (fecha) => {

    return new Promise((resolve, reject) => {
        dbEX(`
        SELECT 
            *
        FROM
            extrusion_labels
        WHERE
            DATE(datetime) LIKE '${fecha}'
        AND 
            (
                    status = "Impreso"
                OR
                    status = "Cancelado"
                OR 
                    status = "Acreditado"
                OR
                    status = "Transferido"
            )
            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getSerialesFechasMultiples = (desde, hasta) => {
    return new Promise((resolve, reject) => {
        dbEX(`
        SELECT 
            *
        FROM
            extrusion_labels
        WHERE
            DATE(datetime) 
        BETWEEN 
            '${desde}'
        AND     
            '${hasta}'
            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getPlanFechasMultiples = (desde, hasta) => {
    return new Promise((resolve, reject) => {
        dbEX(`
        SELECT 
            *
        FROM
            production_plan
        WHERE
            fecha
        BETWEEN 
            '${desde}'
        AND     
            '${hasta}'
            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getColumnsExtr = () => {
    return new Promise((resolve, reject) => {
        db(`
        SELECT 
            column_name
        FROM
            information_schema.columns
        WHERE
            table_schema = 'b10_bartender'
        AND 
            table_name = 'extr'
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.cancelarSeriales = (arraySeriales, motivo,user) => {

    return new Promise((resolve, reject) => {
        for (let i = 0; i < arraySeriales.length; i++) {
            dbEX(`
            UPDATE 
                extrusion_labels
            SET
                status = 'Cancelado', 
                motivo_cancel ='${motivo}',
                emp_cancel='${user}'
            WHERE
                serial= ${arraySeriales[i]}
            
            `)
                .then((result) => { resolve(result) })
                .catch((error) => { reject(error) })
        }

    })
}
funcion.insertImpresion = (plan_id, numero_parte, emp_num, cantidad, numero_etiquetas, impresoType) => {
    return new Promise((resolve, reject) => {

        for (let i = 0; i < numero_etiquetas; i++) {
            dbEX(`INSERT INTO extrusion_labels (plan_id, numero_parte, emp_num, cantidad, status) 
                VALUES ('${plan_id}','${numero_parte}',${emp_num},${cantidad},'${impresoType}')`)
                .then((result) => { resolve(result) })
                .catch((error) => { console.error(error),reject(error) })
        }
    })
}

funcion.getPrinter = (linea) => {
    return new Promise((resolve, reject) => {

        dbEX(`SELECT printer FROM extrusion_conf WHERE linea = ${linea};`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.UpdatePlan = (plan_id) => {
    return new Promise((resolve, reject) => {
        dbEX(`
        UPDATE 
            production_plan 
        SET 
            status = 'Impreso'
        WHERE
            plan_id = ${plan_id};
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getIdPlans = (fecha) => {
    return new Promise((resolve, reject) => {

        dbEX(`SELECT  plan_id, COUNT(*)      
            AS count
        FROM 
            extrusion_labels 
        WHERE 
            datetime 
        LIKE 
            '${fecha}%'

        GROUP BY(plan_id)
            

            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.cancelSerialesPlan = (plan_id, motivo,user) => {
    return new Promise((resolve, reject) => {
        dbEX(`
        UPDATE 
            extrusion_labels 
        SET 
            status = 'Cancelado',
            motivo_cancel = '${motivo}',
            emp_mod= '${user}'
        WHERE
            plan_id = ${plan_id};
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}

funcion.getCountCanceled = (fecha) => {
    return new Promise((resolve, reject) => {

        dbEX(`SELECT  plan_id, COUNT(*)      
            AS count
        FROM 
            extrusion_labels 
        WHERE 
            datetime

        LIKE 
            '${fecha}%'
        AND
            status != 'Impreso'
            
        GROUP BY(plan_id)
            

            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.statusSerial = (seriales) => {
    return new Promise((resolve, reject) => {
        let resultado = []
        seriales.forEach(serial => {

            dbEX(`
            SELECT 
                serial, status, datetime
            FROM 
                extrusion_labels 
            WHERE 
                serial = ${serial}
                `)
                .then((result) => {

                    if (result.length == 0) {
                        let obj = {}
                        obj['serial'] = serial
                        obj['status'] = "No Encontrado"
                        resultado.push(obj)
                    } else {
                        resultado.push(result[0])
                    }

                    if (resultado.length == seriales.length) {
                        resolve(resultado)
                    }
                })
                .catch((error) => { reject(error) })
        });


    })
}


funcion.infoSerial = (seriales) => {
    return new Promise((resolve, reject) => {
        let resultado = []
        seriales.forEach(serial => {
            dbEX(`
            SELECT 
                serial,plan_id, numero_parte, cantidad 
            FROM 
                extrusion_labels 
            WHERE 
                serial = ${serial}
                `)
                .then((result) => {
                    resultado.push(result[0])

                    if (resultado.length == seriales.length) {
                        resolve(resultado)
                    }
                })
                .catch((error) => { reject(error) })
        });


    })
}


funcion.updateSerialesAcred = (seriales, user_id) => {

    return new Promise((resolve, reject) => {
        let affectedRows = 0


        seriales.forEach(serial => {
            if (serial.result != "N/A") {
                dbEX(`
                UPDATE 
                    extrusion_labels 
                SET 
                    status='Acreditado',
                    result_acred='${serial.result}',
                    emp_acred='${user_id}'
                WHERE 
                    serial = ${serial.serial_num}
                    `)
                    .then((result) => {

                        if (result.affectedRows == 1) {
                            affectedRows++
                            if (affectedRows == seriales.length) {

                                resolve(affectedRows)
                            }
                        }
                    })
                    .catch((error) => { reject(error) })

            } else {
                dbEX(`
                UPDATE 
                    extrusion_labels 
                SET 
                    result_acred='${serial.error}',
                    emp_acred='${user_id}'
                WHERE 
                    serial = ${serial.serial_num}
                    `)
                    .then((result) => {

                        if (result.affectedRows == 1) {
                            affectedRows++
                            if (affectedRows == seriales.length) {

                                resolve(affectedRows)
                            }
                        }
                    })
                    .catch((error) => { reject(error) })
            }




        });


    })
}

funcion.updateSerialesTransferidos = (seriales,user_id, status) => {

    return new Promise((resolve, reject) => {
        let affectedRows = 0
        
        seriales.forEach(element => {
            
            if (element.error === "N/A") {
                dbEX(`
                UPDATE 
                    extrusion_labels 
                SET 
                    status='${status}',
                    result_transfer='${element.transfer_order}',
                    emp_transfer='${user_id}'
                WHERE 
                    serial = ${element.serial}
                    `)
                .then((result) => {

                    if (result.affectedRows == 1) {
                        affectedRows++
                        if (affectedRows == seriales.length) {

                            resolve(affectedRows)
                        }
                    }
                })
                .catch((error) => { reject(error) })
            }else{

                resolve("N/A")
                reject("Error")
            }

            
        });


    })
}




funcion.updateSerialesTransferidosPR = (seriales,user_id, status) => {

    return new Promise((resolve, reject) => {
        let affectedRows = 0
        
        seriales.forEach(element => {
            let resultSap
            if(element.transfer_order=="N/A"){
                resultSap=element.error
            }else{
                resultSap=element.transfer_order
            }

            dbEX(`
                UPDATE 
                    extrusion_labels 
                SET 
                    status='${status}',
                    result_return='${resultSap}',
                    emp_return='${user_id}'
                WHERE 
                    serial = ${element.serial}
                    `)
                .then((result) => {

                    if (result.affectedRows == 1) {
                        affectedRows++
                        if (affectedRows == seriales.length) {

                            resolve(affectedRows)
                        }
                    }
                })
                .catch((error) => { reject(error) })


            
        });


    })
}



funcion.graficaReporte = (desde, hasta) => {
    return new Promise((resolve, reject) => {
        dbEX(`
        SELECT 
            s1.numero_sap, s1.programado, s2.producido
        FROM
            (SELECT 
                production_plan.numero_sap AS 'numero_sap',
                SUM(production_plan.cantidad) AS 'programado'
            FROM
                production_plan
            WHERE
                DATE(production_plan.fecha) BETWEEN '${desde}' AND '${hasta}'
            GROUP BY production_plan.numero_sap) AS s1
        LEFT JOIN
            (SELECT 
                extrusion_labels.numero_parte AS 'numero_parte',
                SUM(extrusion_labels.cantidad) AS 'producido'
            FROM
                extrusion_labels
            WHERE
                DATE(extrusion_labels.datetime) BETWEEN '${desde}' AND '${hasta}' AND extrusion_labels.status = "Acreditado"
            GROUP BY 
                extrusion_labels.numero_parte) AS s2 
        ON s1.numero_sap = s2.numero_parte
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })

}


funcion.getAllInfoSerial = (serial) => {
    return new Promise((resolve, reject) => {

        dbEX(`SELECT *
        FROM 
            extrusion_labels 
        WHERE 
            serial= ${serial}
            

            `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.updateObsoleto = (serial_obsoleto) => {
    return new Promise((resolve, reject) => {
        dbEX(`
        UPDATE 
            extrusion_labels 
        SET 
            status = 'Obsoleto'
        WHERE
            serial = ${serial_obsoleto};
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


funcion.getSerial = () => {
    return new Promise((resolve, reject) => {

        dbEX(`SELECT serial FROM extrusion_labels ORDER BY serial DESC LIMIT 1`)
            .then((result) => { resolve(result[0]) })
            .catch((error) => { reject(error) })
    })
}



funcion.getInventario = () => {
    return new Promise((resolve, reject) => {

        dbEX(`SELECT * FROM extrusion_labels WHERE status="Acreditado" OR status="Retornado"`)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}
module.exports = funcion;