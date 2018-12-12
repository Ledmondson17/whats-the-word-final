let navbar = document.getElementsByClassName('nav-bar');
// let sticky = navbar.offsetBottom();

window.addEventListener('scroll',function(e){
  let fromBottom = window.scrollY

  function scroll(){
    if(window.scrollY){
      navbar.classlist.add('sticky')
    }else{
      navbar.classlist.remove('sticky')
      console.log("ayeee");
    }
  }
});


// document.getElementById('blah').addEventListener("click", function(){
//    var x = document.querySelector(".menu-list");
//    if (x.style.display === "block") {
//      x.style.display = "none";
//    } else {
//      x.style.display = "block";
//    }
//    console.log('works');
// });
