// $('#myModal').on('shown.bs.modal', function () {
//     $('#myInput').trigger('focus')
// })


let excelFile = document.getElementById("excelFile")
let btnBorrarContinuar = document.getElementById("btnBorrarContinuar")
let btnCancelar = document.querySelectorAll(".btnCancelar")
let tituloSuccess = document.getElementById("tituloSuccess")
let cantidadSuccess = document.getElementById("cantidadSuccess")
let cargasAnteriores = document.getElementById("cargasAnteriores")
let btnGuardar = document.getElementById("btnGuardar")
let formData = new FormData()
let cardExcel = document.getElementById("cardExcel")
let table = $('#myTable').DataTable();


btnCancelar.forEach(element => {
    element.addEventListener('click', deleteFile)
});



const picker = datepicker('#selectFecha', {
    customDays: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    overlayPlaceholder: 'Seleccionar Mes',
    customMonths: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    disabled: true,
    minDate: new Date(2020, 0, 1),
    formatter: (input, date, instance) => {
        let mm = date.getMonth() + 1;
        let dd = date.getDate();
        let yy = date.getFullYear();
        let myDateString = yy + '-' + mm + '-' + dd;
        input.value = myDateString

        table.clear().draw();
        fillTable( $('#selectFecha').val());
    }
})



function fillTable(fecha) {

    axios({
        method: 'get',
        url: `/tablaProgramacion/${fecha}`,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json', }
    })
        .then((result) => {
           
                for (let y = 0; y < result.data.length; y++) {
                    let cancelar= `<input type="text" name="idPlan" value=${result.data[y].plan_id} hidden><button type="submit" formaction="/cancelar"
                    class="btn btn-danger  rounded-pill" name="id"><span class="fas fa-times"></span>`
                    table.row.add( [
                        cancelar,
                        result.data[y].numero_sap,
                        result.data[y].sup_name,
                        result.data[y].cantidad,
                        result.data[y].fecha,
                        result.data[y].turno,
                        result.data[y].status,
                    ] ).draw( false );

            }
        })
        .catch((err) => { console.error(err) })
}