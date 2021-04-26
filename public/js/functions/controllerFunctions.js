const funcion = {};

const db = require('../../db/conn_b10_bartender');
const dbE = require('../../db/conn_empleados');
const dbEX = require('../../db/conn_extr');
const dbA = require('../../db/conn_areas');
const { resolveInclude } = require('ejs');


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
            datetime LIKE '${fecha}%'
            
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
funcion.insertImpresion = (plan_id, numero_parte, emp_num, cantidad, numero_etiquetas) => {
    return new Promise((resolve, reject) => {

        for (let i = 0; i < numero_etiquetas; i++) {
            dbEX(`INSERT INTO extrusion_labels (plan_id, numero_parte, emp_num, cantidad) 
                VALUES ('${plan_id}','${numero_parte}',${emp_num},${cantidad})`)
                .then((result) => { resolve(result) })
                .catch((error) => { reject(error) })
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
    return new Promise((resolve,reject)=>{
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

funcion.cancelSerialesPlan = (plan_id, motivo) => {
    return new Promise((resolve,reject)=>{
        dbEX(`
        UPDATE 
            extrusion_labels 
        SET 
            status = 'Cancelado',
            descripcion = '${motivo}'
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
        let resultado=[]
        seriales.forEach(serial => {
            
            dbEX(`SELECT serial, status FROM extrusion_labels WHERE serial = ${serial}`)
            .then((result) => { 

                if(result.length==0){
                    let obj ={}
                    obj['serial']=serial
                    obj['status']="No Encontrado"
                    resultado.push(obj)
                }else{
                    resultado.push(result[0])
                }
             
                if(resultado.length==seriales.length){
                    resolve(resultado)
                }
            })
            .catch((error) => { reject(error) })
        });
        

    })
}


funcion.infoSerial = (seriales) => {
    return new Promise((resolve, reject) => {
        let resultado=[]
        seriales.forEach(serial => {
            
            dbEX(`SELECT serial, status FROM extrusion_labels WHERE serial = ${serial}`)
            .then((result) => { 
                    resultado.push(result[0])
             
                if(resultado.length==seriales.length){
                    resolve(resultado)
                }
            })
            .catch((error) => { reject(error) })
        });
        

    })
}

module.exports = funcion;