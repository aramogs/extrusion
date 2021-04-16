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
            emp_area = "TO"
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
                reject(error) })
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

funcion.insertProgramaExcel = (base, tabla, titulos, valores,sup_num,fecha,turno) => {
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


funcion.cancelarIdPlan = (idplan,motivo) => {
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

module.exports = funcion;