// $('#myModal').on('shown.bs.modal', function () {
//     $('#myInput').trigger('focus')
// })



let btnCancelar = document.querySelectorAll(".btnCancelar")
let tituloSuccess = document.getElementById("tituloSuccess")
let cantidadSuccess = document.getElementById("cantidadSuccess")
let cargasAnteriores = document.getElementById("cargasAnteriores")
let btnGuardar = document.getElementById("btnGuardar")
let cardExcel = document.getElementById("cardExcel")
let table = $('#myTable').DataTable();
let midplan = document.getElementById("midplan")
let formMotivo = document.getElementById("formMotivo")
let selectFecha= document.getElementById("selectFecha")
let myDateString
let motivo= document.getElementById("motivo")
let msap= document.getElementById("msap")
let mcantidad= document.getElementById("mcantidad")
let mfecha= document.getElementById("mfecha")



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
        myDateString = yy + '-' + mm + '-' + dd;
        input.value = myDateString

        table.clear().draw();
        fillTable();
    }
})



function fillTable() {
   
    let data = {"fecha":`${myDateString}`}
    axios({
        method: 'post',
        url: `/tablaProgramacion`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    }).then((result)=>{ 
            
           
                for (let y = 0; y < result.data.length; y++) {
                    let cancelar
                    if (result.data[y].status=="Pendiente") {

                        cancelar= `<input type="text" name="idPlan" id="idPlan${result.data[y].plan_id}" value=${result.data[y].plan_id} hidden><button type="submit" formaction="/cancelar"
                        class="btn btn-danger  rounded-pill" name="btnCancel" id="btnCancel-${result.data[y].plan_id}" onClick="cancel(this.id)" ><span class="fas fa-times"></span>
                        <button type="submit" formaction="/actualizar" class="btn btn-info  rounded-pill"
                                        nname="btnCancel" id="btnCancel-${result.data[y].plan_id}" onClick="cancel(this.id)"><span class="fas fa-pencil-alt">` 

                    }else{cancelar=""}
                   

                    table.row.add( [
                        cancelar,
                        result.data[y].plan_id,
                        result.data[y].numero_sap,
                        result.data[y].cantidad,
                        result.data[y].linea,
                        result.data[y].sup_name,
                        result.data[y].fecha,
                        result.data[y].turno,
                        result.data[y].status,
                        result.data[y].description,
                    ] ).draw( false );

            }
        })
        .catch((err) => { console.error(err) })
}


function cancel(clicked_id)
  {
    $('#modalMotivo').modal({ keyboard: false })
    let id = clicked_id.split('-');
    let idp = id[id.length - 1];
    midplan.value=idp;

    infoId(idp)
    
  }

  formMotivo.addEventListener("submit", (e)=>{
      e.preventDefault();

      let data = {"id":`${midplan.value}`, "motivo":`${motivo.value}`}

      axios({
        method: 'post',
        url: `/cancelarIdPlan`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then((result) => {

      reload()
        
    })
    .catch((err) => { console.error(err) })

  })


  function reload(){
      motivo.value="";
    $('#modalMotivo').modal('hide');
    table.clear().draw();
    fillTable();

  }


  function infoId(idp){

    let data = {"id":`${idp}`}
    axios({
        method: 'post',
        url: `/idplanInfo`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then((result) => {

        msap.innerHTML=result.data[0].numero_sap
        mcantidad.innerHTML=result.data[0].cantidad
        mfecha.innerHTML=result.data[0].fecha

        
    })
    .catch((err) => { console.error(err) })

  }

