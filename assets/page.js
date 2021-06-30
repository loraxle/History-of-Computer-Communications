var book_data = {};
var pdfs = [];
var search_array = Object.entries(book_data);
var toc = "";
const CACHE_NAME = "v2fddf80";
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/assets/service-worker.js")
    .then(serviceWorker => {
      //console.log("Service Worker registered: ", serviceWorker);
      fetch('/json/index.json')
        .then(response => response.json())
        .then(data => {
          book_data = data;
          toc = book_data["toc"];
          delete book_data["toc"]; // remove toc
          search_array = Object.entries(book_data);
        });
      fetch('/assets/pdf.json')
        .then(response => response.json())
        .then(data => {
          pdfs = data;
        });
    })
    .catch(error => {
      console.error("Error registering the Service Worker: ", error);
    });
}

function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}

var searchResults = document.getElementById("search-results");
var menu = document.querySelector(".sidebar");

function sidemenu() {
  if (menu.classList.contains("slide-in-left")) {
    menu.classList.remove("slide-in-left");
    document.getElementById("burg").classList.remove("is-active");
  }
  else {
    menu.classList.add("slide-in-left");
    document.getElementById("burg").classList.add("is-active");   
  }
}

function showResults() {
  const width  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (width < 900) { // media query breakpoint
    if (menu.classList.contains("slide-in-left")) {
      menu.classList.remove("slide-in-left");
      document.getElementById("burg").classList.remove("is-active");
    }    
  }
  if (searchResults.className != "slide-in-right") {
    searchResults.classList.add("slide-in-right");
  }
}

function hideResults() {
  searchResults.classList.remove("slide-in-right");
}

function decode (str) {
    return str.replace(/&apos;/g, "'")
               .replace(/&quot;/g, '"')
               .replace(/&gt;/g, '>')
               .replace(/&lt;/g, '<')
               .replace(/&amp;/g, '&');
};