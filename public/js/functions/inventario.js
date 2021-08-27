let table = $('#myTable').DataTable({
    "order":[[1,"asc"]],
    "pageLength": 10,

    "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
    dom: 'Blfrtip',
    buttons: [
      {
        extend: 'copyHtml5',
        title: "Extrusion_Inv"
      },
      {
        extend: 'csvHtml5',
        title: "Extrusion_Inv"
      },
      {
        extend: 'excelHtml5',
        title: null,
        filename: "Extrusion_Inv"
      },
    ]
})


$(document).ready(function () {

    fillTable()

})


function fillTable() {
   
    axios({
        method: 'post',
        url: `/getInventario`,
        headers: { 'content-type': 'application/json' }
    }).then((result)=>{ 
            
        console.log(result);
           
                for (let y = 0; y < result.data.length; y++) {

                   

                    table.row.add( [
                        result.data[y].serial,
                        result.data[y].plan_id,
                        result.data[y].numero_parte,
                        result.data[y].emp_num,
                        result.data[y].cantidad,
                        result.data[y].datetime,
                        result.data[y].status,
                        result.data[y].result_acred,
                        result.data[y].emp_acred,
                        result.data[y].result_transfer,
                        result.data[y].emp_transfer,
                        result.data[y].result_return,
                        result.data[y].emp_return,



     
                    ] ).draw( false );

            }
        })
        .catch((err) => { console.error(err) })
}



 











