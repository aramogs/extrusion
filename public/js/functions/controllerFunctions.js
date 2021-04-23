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
            turnos`)
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
            .catch((error) => {
                console.log(error);
                reject(error)
            })
    })
}

funcion.verifySAP = (base, tabla, callback) => {
    if (base === "b10_bartender") {
        db(`SELECT no_sap FROM ${tabla} `, function (err, result, fields) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        })
    }


}

funcion.insertProgramaExcel = (base, tabla, titulos, valores, sup_num, fecha, turno) => {
    return new Promise((resolve, reject) => {

        let valor
        let valores_finales = []
        let affectedRows = 0

        for (let i = 0; i < valores.length; i++) {
            valores_finales = []
            for (let y = 0; y < titulos.length; y++) {

                if (typeof (valores[i][y]) === "string") {
                    valor = `"${valores[i][y]}"`
                } else if (typeof (valores[i][y])) {
                    valor = valores[i][y]
                }
                valores_finales.push(valor)

            }
            valores_finales.push(`"${sup_num}"`)
            valores_finales.push(`"${fecha}"`)
            valores_finales.push(`"${turno}"`)


            dbEX(`INSERT INTO ${tabla} (${titulos.join()},sup_name,fecha,turno) VALUES (${valores_finales})`)
                .then((result) => {
                    if (result.affectedRows == 1) {
                        affectedRows++
                    }
                    if (affectedRows == valores.length) {
                        resolve(affectedRows)
                    }
                })
                .catch((error) => { reject(error) })
        }


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
            *
        FROM
            production_plan, b10_bartender.extr
        WHERE
            fecha = '${fecha}'
        AND
            turno = '${turno}'
        AND 
            linea = '${linea}' 
        AND
            numero_sap = no_sap
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
            description ='${motivo}'
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


funcion.getSerialesFecha = (fecha) => {
    
    fecha = "2021-04-22"
    return new Promise((resolve, reject) => {
        dbEX(`
        SELECT 
            *
        FROM
            extrusion_labels
        WHERE
            datetime LIKE '${fecha}%'
        `)
            .then((result) => { resolve(result) })
            .catch((error) => { reject(error) })
    })
}


//TODO optimizar funcion
funcion.cancelarSeriales = (arraySeriales, motivo) => {

    return new Promise((resolve, reject) => {
        for (let i = 0; i < arraySeriales.length; i++) {
            dbEX(`
            UPDATE 
                extrusion_labels
            SET
                status = 'Cancelado', 
                descripcion ='${motivo}'
            WHERE
                serial= ${arraySeriales[i]}
            
            `)
                .then((result) => { resolve(result) })
                .catch((error) => { reject(error) })           
        }


    })
}

module.exports = funcion;