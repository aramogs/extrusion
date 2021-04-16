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