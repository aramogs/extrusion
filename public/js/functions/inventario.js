

let tableBody = document.getElementById("myTable").getElementsByTagName('tbody')[0]
let table_ = document.getElementById("table_")

$(document).ready(function () {

  fillTable()

  $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })

})


function fillTable() {
  table_.style.display = "none"
  axios({
    method: 'post',
    url: `/getInventario`,
    headers: { 'content-type': 'application/json' }
  }).then((result) => {

    for (let y = 0; y < result.data.length; y++) {
      let row = tableBody.insertRow();



      row.insertCell(0).innerHTML = result.data[y].serial
      row.insertCell(1).innerHTML = result.data[y].plan_id
      row.insertCell(2).innerHTML = result.data[y].numero_parte
      row.insertCell(3).innerHTML = result.data[y].emp_num
      row.insertCell(4).innerHTML = result.data[y].cantidad
      row.insertCell(5).innerHTML = result.data[y].datetime
      row.insertCell(6).innerHTML = result.data[y].status
      row.insertCell(7).innerHTML = result.data[y].result_acred
      row.insertCell(8).innerHTML = result.data[y].emp_acred
      row.insertCell(9).innerHTML = result.data[y].result_transfer
      row.insertCell(10).innerHTML = result.data[y].emp_transfer
      row.insertCell(11).innerHTML = result.data[y].result_return
      row.insertCell(12).innerHTML = result.data[y].emp_return


    }

    $('#myTable').DataTable({
      "order": [[1, "asc"]],
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
    table_.style.display = "block"
    setTimeout(function () { $('#modalSpinner').modal('hide') }, 1000);

    

  })
    .catch((err) => { console.error(err) })
}
