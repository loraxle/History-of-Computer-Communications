var book_data = {};
var pdfs = [];
var search_array = Object.entries(book_data);
const CACHE_NAME = "v2fddf80";
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/assets/sw.js?v=2fddf80")
    .then(serviceWorker => {
      //console.log("Service Worker registered: ", serviceWorker);
    })
    .catch(error => {
      console.error("Error registering the Service Worker: ", error);
    });
}

function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}

r(function(){
  window.caches.open(CACHE_NAME).then(cache => {
    cache.match("/json/index.json").then(cached => {
      try {
        cached.json().then(cached_data => {
          book_data = cached_data;
          search_array = Object.entries(book_data);
        });
      } catch (error) {
        console.log(error);
      }
    });
    cache.match("/assets/pdf.json").then(cached => {
      try {
        cached.json().then(cached_data => {
          pdfs = cached_data;
        });
      } catch (error) {
        console.log(error);
      }
    });
  });
});

var searchResults = document.getElementById("search-results");
var menu = document.querySelector(".sidebar");

function showResults() {
  if (searchResults.className != "slide-in-right") {
    searchResults.classList.add("slide-in-right");
  }
}

function hideResults() {
  searchResults.classList.remove("slide-in-right");
}

function formatImgs(){
  var imgs = document.querySelectorAll("section p img");
  for (var i = imgs.length - 1; i >= 0; i--) {
    var filename=imgs[i].src.split('/').pop()
    classname = "imgc";
    if (filename.includes("-c.")) {
      classname = "imgc";
    } else if (filename.includes("-l.")) {
      classname = "imgl";
    } else if (filename.includes("-r.")) {
      classname = "imgr";
    }
    var formattedImg = 
      "<div class='" + classname + "'>" + 
        "<img src='" + imgs[i].src + "' alt='" + imgs[i].src + "' title='" + imgs[i].src + "'>" + 
        "<h3>" + imgs[i].title + "</h3>" + 
      "</div";
    imgs[i].parentNode.innerHTML = formattedImg; 
  }   
}

function decode (str) {
    return str.replace(/&apos;/g, "'")
               .replace(/&quot;/g, '"')
               .replace(/&gt;/g, '>')
               .replace(/&lt;/g, '<')
               .replace(/&amp;/g, '&');
};