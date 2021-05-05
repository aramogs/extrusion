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


let tableSerials = $('#tableSerials').DataTable({
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

});
let tablePlan = $('#tablePlan').DataTable({
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
        tableSerials.clear().draw();
        fillTableSeriales()
        fillTablePlan()
        grafica()
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
        tableSerials.clear().draw();
        tablePlan.clear().draw();
        fillTableSeriales()
        fillTablePlan()
        grafica()

    }
})


function fillTableSeriales() {

    if (fechaHasta == undefined) fechaHasta = fechaDesde
    let data = { "desde": `${fechaDesde}`, "hasta": `${fechaHasta}` }
    axios({
        method: 'post',
        url: `/tablaSerialesFechasMultiples`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    }).then(result => {
        serialesAxios = result.data

        for (let i = 0; i < result.data.length; i++) {
            new Date().toLocaleString

            tableSerials.row.add([
                result.data[i].serial,
                result.data[i].plan_id,
                result.data[i].numero_parte,
                result.data[i].emp_num,
                result.data[i].cantidad,
                new Date(result.data[i].datetime).toLocaleString(),
                result.data[i].motivo_cancel,
                result.data[i].status,
                result.data[i].resultado_sap,
                result.data[i].emp_mod,
            ]).draw(false);

        }
    })
        .catch((err) => { console.error(err) })
}


function fillTablePlan() {

    if (fechaHasta == undefined) fechaHasta = fechaDesde
    let data = { "desde": `${fechaDesde}`, "hasta": `${fechaHasta}` }
    axios({
        method: 'post',
        url: `/tablaPlanFechasMultiples`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    }).then(result => {

        planesAxios = result.data
        for (let i = 0; i < result.data.length; i++) {
            new Date().toLocaleString

            tablePlan.row.add([
                result.data[i].plan_id,
                result.data[i].numero_sap,
                result.data[i].cantidad,
                result.data[i].linea,
                result.data[i].sup_name,
                new Date(result.data[i].fecha).toLocaleDateString(),
                result.data[i].turno,
                result.data[i].status,
                result.data[i].motivo_cancel,
            ]).draw(false);

        }
    })
        .catch((err) => { console.error(err) })
}


function grafica() {

    if (fechaHasta == undefined) fechaHasta = fechaDesde
    let data = { "desde": `${fechaDesde}`, "hasta": `${fechaHasta}` }
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

            if (count != 0) chart.destroy()

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

