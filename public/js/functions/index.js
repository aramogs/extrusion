$("#menu-toggle").click(function (e) {
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
  $("#menu-toggle").toggleClass("fa-angle-double-left fa-angle-double-right");
});


$(document).ready(function(){
  $('.hide_show').hide();  
  $('.hide_show2').hide(); 
})

$('#click_hide_show').click(function(){
  $('.hide_show').toggle(500);
})

$('#click_hide_show2').click(function(){
  $('.hide_show2').toggle(500);
})

bottomWrapper = document.getElementById("back-to-top-wrapper");

var myScrollFunc = function () {
    var y = window.scrollY;
    if (y >= 200) {
        bottomWrapper.className = "bottomMenu wrapper-show"
    } else {
        bottomWrapper.className = "bottomMenu wrapper-hide"
    }
};

window.addEventListener("scroll", myScrollFunc);

function spinnerDataTabale() {
  let empty_table = document.getElementsByClassName("dataTables_empty")
  empty_table[0].style.fontSize = "50px"
  empty_table[0].innerHTML = `<i class="text-warning fas fa-stopwatch animate__animated animate__infinite	infinite"></i>`
  document.getElementsByClassName("fa-stopwatch")[0].classList.add("animate__animated", "animate__infinite",	"infinite", "animate__flipInX")
}