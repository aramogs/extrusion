
let tableSerials = $('#tableSerials').DataTable();
let fechaDesde
let fechaHasta




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
        fechaDesde = yy + '-' + mm + '-' + dd;
        input.value = fechaDesde
        tableSerials.clear().draw();
        fillTable()
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
        fechaHasta = yy + '-' + mm + '-' + dd;
        input.value = fechaHasta
        tableSerials.clear().draw();
        fillTable()

    }
})


function fillTable() {

    if (fechaHasta == undefined) fechaHasta = fechaDesde
    let data = { "desde": `${fechaDesde}`,"hasta": `${fechaHasta}` }
    axios({
        method: 'post',
        url: `/tablaSerialesFechasMultiples`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    }).then(result => {


        for (let i = 0; i < result.data.length; i++) {
            new Date().toLocaleString

            tableSerials.row.add([
                result.data[i].serial,
                result.data[i].plan_id,
                result.data[i].numero_parte,
                result.data[i].emp_num,
                result.data[i].cantidad,
                result.data[i].datetime,
                result.data[i].motivo_cancel,
                result.data[i].status,
                result.data[i].resultado_sap,
            ]).draw(false);

        }
    })
        .catch((err) => { console.error(err) })
}