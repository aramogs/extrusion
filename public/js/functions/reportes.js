let fileDate = new Date()
let fechaDesde
let fechaHasta
let btnExcelMultiple = document.getElementById("btnExcelMultiple")
let Search_All = document.getElementById("Search_All")
let serialesAxios
let planesAxios
let chart
let count = 0
let barChart = document.getElementById("bar-chart-grouped")
let tableSerialsBody = document.getElementById("tableSerials").getElementsByTagName("tbody")[0]
let tablePlanBody = document.getElementById("tablePlan").getElementsByTagName("tbody")[0]
let table_hide_seriales = document.getElementById("table_hide_seriales")
let table_hide_plan = document.getElementById("table_hide_plan")
let barPlan = document.getElementById("barPlan");
let barSerials = document.getElementById("barSerials");
let tableSerials
let tablePlan






Search_All.addEventListener("keyup", () => {

    tableSerials.search(Search_All.value).draw()
    tablePlan.search(Search_All.value).draw()
})
btnExcelMultiple.addEventListener("click", () => {

    tableSerials.button('0').trigger()
    tablePlan.button('0').trigger()

    btnExcelMultiple.setAttribute('download', 'Grafico.png');
    btnExcelMultiple.setAttribute('href', barChart.toDataURL("image/png").replace("image/png", "image/octet-stream"));

})



function verifyCount() {
    
    if (count != 0) {
        // chart.destroy()
        tablePlan.clear().destroy()
        tableSerials.clear().destroy()
        barSerials.style.width = 0 + "%";
        barPlan.style.width = 0 + "%";

    }
    count++
}

const desde = datepicker('#selectDesde', {
    id: 1,
    customDays: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    overlayPlaceholder: 'Seleccionar Mes',
    customMonths: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    disabled: true,
    minDate: new Date(2021, 3, 1),
    formatter: (input, date, instance) => {
        let mm = date.getMonth() + 1;
        let dd = date.getDate();
        let yy = date.getFullYear();
        if (mm <= 9) mm = '0' + mm;
        if (dd <= 9) dd = '0' + dd;
        fechaDesde = yy + '-' + mm + '-' + dd;
        input.value = fechaDesde
        verifyCount()
        fillTableSeriales()
        fillTablePlan()
        // grafica()

    }
})

const hasta = datepicker('#selectHasta', {
    
    id: 1,
    customDays: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    overlayPlaceholder: 'Seleccionar Mes',
    customMonths: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    disabled: false,
    minDate: new Date(2021, 3, 1),
    formatter: (input, date, instance) => {
        let mm = date.getMonth() + 1;
        let dd = date.getDate();
        let yy = date.getFullYear();
        if (mm <= 9) mm = '0' + mm;
        if (dd <= 9) dd = '0' + dd;
        fechaHasta = yy + '-' + mm + '-' + dd;
        input.value = fechaHasta
        verifyCount()
        fillTableSeriales()
        fillTablePlan()
        // grafica()

    }
})


async function fillTableSeriales() {
    let countSerial = 0

    let data
    if (fechaHasta == undefined) {
        data = { "desde": `${fechaDesde}`, "hasta": `${fechaDesde}` }
    } else {
        data = { "desde": `${fechaDesde}`, "hasta": `${fechaHasta}` }
    }

    axios({
        method: 'post',
        url: `/tablaSerialesFechasMultiples`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    }).then(result => {
        serialesAxios = result.data
        table_hide_seriales.style.display = "none"

        for (let i = 0; i < result.data.length; i++) {

            countSerial++
            barSerials.style.width = (countSerial / serialesAxios.length) * 100 + "%"

            let row = tableSerialsBody.insertRow();

            row.insertCell(0).innerHTML = result.data[i].serial
            row.insertCell(1).innerHTML = result.data[i].plan_id
            row.insertCell(2).innerHTML = result.data[i].numero_parte
            row.insertCell(3).innerHTML = result.data[i].emp_num
            row.insertCell(4).innerHTML = result.data[i].cantidad
            row.insertCell(5).innerHTML = new Date(result.data[i].datetime).toLocaleString()
            row.insertCell(6).innerHTML = result.data[i].motivo_cancel
            row.insertCell(7).innerHTML = result.data[i].status
            row.insertCell(8).innerHTML = result.data[i].result_acred
            row.insertCell(9).innerHTML = result.data[i].emp_acred



        }
        table_hide_seriales.style.display = "block"

        tableSerials = $('#tableSerials').DataTable({
            dom: 'Blfrtip',
            searching: true,
            paging: true,
            info: true,
            buttons: [
                {
                    extend: 'excelHtml5',
                    title: `Reporte Extrusion Seriales ${fileDate.toLocaleString()}`,
                    filename: `Reporte Extrusion Seriales ${fileDate.toLocaleString()}`,
                    className: "d-none"
                }
            ],

        })

            ;
    })
        .catch((err) => { console.error(err) })
}


async function fillTablePlan() {
    let countPlan = 0

    let data
    if (fechaHasta == undefined) {
        data = { "desde": `${fechaDesde}`, "hasta": `${fechaDesde}` }
    } else {
        data = { "desde": `${fechaDesde}`, "hasta": `${fechaHasta}` }
    }
    axios({
        method: 'post',
        url: `/tablaPlanFechasMultiples`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    }).then(result => {
        planesAxios = result.data
        table_hide_plan.style.display = "none"



        for (let i = 0; i < result.data.length; i++) {

            countPlan++
            barPlan.style.width = (countPlan / planesAxios.length) * 100 + "%"

            let row2 = tablePlanBody.insertRow();

            row2.insertCell(0).innerHTML = result.data[i].plan_id
            row2.insertCell(1).innerHTML = result.data[i].numero_sap
            row2.insertCell(2).innerHTML = result.data[i].cantidad
            row2.insertCell(3).innerHTML = result.data[i].linea
            row2.insertCell(4).innerHTML = result.data[i].sup_name
            row2.insertCell(5).innerHTML = new Date(result.data[i].fecha).toLocaleDateString()
            row2.insertCell(6).innerHTML = result.data[i].turno
            row2.insertCell(7).innerHTML = result.data[i].status
            row2.insertCell(8).innerHTML = result.data[i].motivo_cancel



        }
        table_hide_plan.style.display = "block"
        tablePlan = $('#tablePlan').DataTable({
            dom: 'Blfrtip',
            searching: true,
            paging: true,
            info: true,
            buttons: [
                {
                    extend: 'excelHtml5',
                    title: `Reporte Extrusion Plan ${fileDate.toLocaleString()}`,
                    filename: `Reporte Extrusion Plan ${fileDate.toLocaleString()}`,
                    className: "d-none"
                }
            ]
        });

    })
        .catch((err) => { console.error(err) })
}


function grafica() {

    let data
    if (fechaHasta == undefined) {
        data = { "desde": `${fechaDesde}`, "hasta": `${fechaDesde}` }
    } else {
        data = { "desde": `${fechaDesde}`, "hasta": `${fechaHasta}` }
    }
    axios({
        method: 'post',
        url: `/reporteGrafico`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
        .then(result => {


            let valores = result.data

            let numeros_sap = []
            let programado = []
            let producido = []

            numeros_sap = []
            programado = []
            producido = []

            valores.forEach(valor => {
                numeros_sap.push(valor.numero_sap)
                programado.push(valor.programado)
                producido.push(valor.producido)
            });


            chart = new Chart(barChart, {

                type: 'bar',
                data: {
                    labels: numeros_sap,
                    datasets: [
                        {
                            label: "Planeado",
                            backgroundColor: "rgb(2, 117, 216, 0.5)",
                            borderColor: "rgb(2, 117, 216)",
                            borderWidth: 2,
                            data: programado
                        }, {
                            label: "Acreditado",
                            backgroundColor: 'rgb(92, 184, 92, 0.5)',
                            borderColor: "	rgb(92, 184, 92)",
                            borderWidth: 2,
                            data: producido
                        }
                    ]
                },
                options: {
                    plugins: {
                        zoom: {
                            limits: {
                                x: { min: 0, max: 200, minRange: 50 },
                                y: { min: 0, max: 200, minRange: 50 }
                            },
                            pan: {
                                enabled: true,
                                mode: 'x',
                                sensitivity: 3,
                                speed: 1,

                            },
                            zoom: {
                                enabled: true,
                                mode: 'x',

                            }
                        }
                    }
                }
            });
            count++
        })

        .catch(err => { console.error(err) })

}

