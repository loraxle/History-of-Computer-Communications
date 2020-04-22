var refreshed = true;
if (window.location.hash) { // URL Fragment exists
  var fragment = decodeURI(window.location.hash).split("#")[1];
  if (!isNaN(fragment)) { //only using integers for URL fragment
    refreshed = false;
    fragment = "section" + fragment;
    var activeSection = document.getElementsByName(fragment);
    if (activeSection.length > 0) {
      uncheck(activeSection[0], 'nav');
      activeSection[0].checked=true;
      document.querySelector(".selected").classList.remove("selected");
      activeSection[0].classList.add("selected");
      crawlDOM(activeSection[0]);
    }
  }
}
if (refreshed) {
  var selected = document.querySelector(".selected");
  if (selected) {
    crawlDOM(selected);
  }
}

function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}

var book_data = {};

r(function(){
    let sidenav = document.querySelector(".sidenav");
    if (sessionStorage.getItem("scroll")) {
      sidenav.scrollTop = sessionStorage.getItem("scroll");
    }
    sidenav.classList.remove("notready"); 
    sidenav.classList.add("ready");
    getJSON()
    .then(JSON.parse)
    .then(function(response) {
        book_data = response;
    });
});

window.addEventListener('beforeunload', (event) => {
  sessionStorage.setItem("scroll", document.querySelector(".sidenav").scrollTop);
  return;
});

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
function formatImgs(){
  var imgs = document.querySelectorAll("section p img");
  for (var i = imgs.length - 1; i >= 0; i--) {
    var filename=imgs[i].src.split('/').pop()
    classname = "";
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

formatImgs();

function crawlDOM(elm) {
  var crawling = true;
  do {
    if (elm.className) {
      if (elm.classList.contains("nav__list")) {
        crawling = false;          
      }
    }
    elm = elm.parentNode;
    if (elm.tagName == "LI") {
      for (var i=0; i < elm.childNodes.length; i++) {
        if (elm.childNodes[i].tagName == "INPUT") {
          if (elm.childNodes[i].type == "checkbox") {
            elm.childNodes[i].checked = true;
          }   
        }
      }
    }
  }
  while (crawling); 
}

window.addEventListener('popstate', (event) => {
  //console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
  if (event.state) {
    if (event.state.section) {
      var section_id = event.state.section;
      document.querySelector(".selected").classList.remove("selected");
      var hash_array = section_id.split("#");
      if (hash_array.length > 1) {
        var hashSection = document.getElementsByName("section" + hash_array[1]);
        if (hashSection.length > 0) {
          hashSection[0].classList.add("selected");
        }
      } else {
         document.getElementById(section_id).classList.add("selected");
      }
    }
    if (event.state.scroll) {
      document.querySelector(".sidenav").scrollTop = event.state.scroll;
    }
  }
});

function decode (str) {
    return str.replace(/&apos;/g, "'")
               .replace(/&quot;/g, '"')
               .replace(/&gt;/g, '>')
               .replace(/&lt;/g, '<')
               .replace(/&amp;/g, '&');
};

var navList = document.querySelector(".nav__list");
for (var i=0; i < navList.childNodes.length; i++) {
  if (navList.childNodes[i].tagName == "LI") {
    for (var idx=0; idx < navList.childNodes[i].childNodes.length; idx++) {
      if (navList.childNodes[i].childNodes[idx].tagName == "INPUT") {
        navList.childNodes[i].addEventListener("click", function(e){
          if (e.target.tagName == "A") {
            if (
              e.ctrlKey || 
              e.shiftKey || 
              e.metaKey || // apple
              (e.button && e.button == 1) // middle click, >IE9 + everyone else
            ){
              return; //allow links to open new tabs
            }
            e.preventDefault();
            document.querySelector(".selected").classList.remove("selected");
            e.target.classList.add("selected");
            e.target.blur();
            var section_id = e.target.pathname.replace("/History-of-Computer-Communications/section/", "");
            section_id = section_id.replace("/", "");
            document.querySelector("content").innerHTML = decode(book_data[section_id].content);
            formatImgs();
            document.getElementById("chapter-title").innerHTML = book_data[section_id].ch_title;
            document.getElementById("section-title").innerHTML = book_data[section_id].title;
            console.log(book_data[section_id]);
            if (book_data[section_id].prev) {
              document.getElementById("prevwrap").classList.add("hide");
              document.getElementById("preva").href = book_data[section_id].prev;
            }
            else {
              document.getElementById("prevwrap").classList.add("hide");  
              document.getElementById("preva").href = "";
            }
            if (book_data[section_id].next) {
              document.getElementById("nexta").href = book_data[section_id].prev;
              document.getElementById("nextwrap").classList.remove("hide");
            }
            else {
              document.getElementById("nextwrap").classList.add("hide");  
              document.getElementById("nexta").href = "";
            }            
            document.getElementById("footnotes").innerHTML = "";
            if (book_data[section_id].footnotes) {
              var ul = document.createElement("UL");
              for (var f=0; f < book_data[section_id].footnotes.length; f++) {
                var li = document.createElement("LI");
                var a = document.createElement("A");
                a.name = "fn" + book_data[section_id].footnotes[f].num;
                a.href = "#fnloc" + book_data[section_id].footnotes[f].num;
                a.textContent = "[" + book_data[section_id].footnotes[f].num + "]";
                var a_str =
                    "<a name='fn" + book_data[section_id].footnotes[f].num +"' href='#fnloc" + book_data[section_id].footnotes[f].num + "'>" + 
                      "[" + book_data[section_id].footnotes[f].num + "]" + 
                    "</a>: " + book_data[section_id].footnotes[f].src;
                li.innerHTML =  a_str;
                ul.appendChild(li);
              }
              document.getElementById("footnotes").appendChild(ul);
            }
            if (e.target.hash) {
              section_id = section_id + e.target.hash;
            }
            var scroll = document.querySelector(".sidenav").scrollTop;
            const state = { 'section': section_id, 'scroll': scroll };
            const title = '';
            const url = e.target.pathname + e.target.hash;
            history.pushState(state, title, url)   ;
            return false;
          }
        }, false);
      }
    } 
  }
}

function getJSON() {
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open("GET", "/History-of-Computer-Communications/json/");

    req.onload = function() {
      if (req.status == 200) {
        resolve(req.response);
      }
      else {
        return reject(Error(req.statusText));
        console.log(req.response);
      }
    };

    req.onerror = function() {
      reject(Error("Network Error"));
    };

    req.send();
  });
}