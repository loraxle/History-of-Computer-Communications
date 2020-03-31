var searchbar = document.querySelector("input[name='search']");

function search(){
  if (searchbar.value) {
    console.log(searchbar.value);
  }
  else {
    searchbar.focus();
  }
}

searchbar.onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
      showResults();
      return false;
    }
}

searchbar.onfocus = function(e){
  showResults();
}

var menu = document.querySelector(".sidebar");

function sidemenu() {
  if (searchResults.classList.contains("slide-in-right")) {
    searchResults.classList.remove("slide-in-right");
    document.getElementById("burg").classList.remove("is-active");
  }
  if (menu.classList.contains("slide-in-left")) {
    menu.classList.remove("slide-in-left");
    document.getElementById("burg").classList.remove("is-active");
  }
  else {
    menu.classList.add("slide-in-left");
    document.getElementById("burg").classList.add("is-active");   
  }
}

var searchResults = document.getElementById("search-results");

function showResults() {
  const width  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (width < 900) { // media query breakpoint
    if (menu.classList.contains("slide-in-left")) {
      menu.classList.remove("slide-in-left");
      document.getElementById("burg").classList.remove("is-active");
    }    
  }
  searchResults.classList.toggle("slide-in-right");
}

function hideResults() {
  searchResults.classList.remove("slide-in-right");
}
function uncheck(selected_element, uncheck_name){
	var items=document.getElementsByName(uncheck_name);
	for(var i=0; i<items.length; i++){
		if(items[i].type=='checkbox' && items[i].id != selected_element.id) {
			items[i].checked=false;
		}
	}
}