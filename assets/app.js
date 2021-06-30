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
          delete book_data["toc"]; // remoce toc
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

var menu = document.querySelector(".sidebar");
var preva = document.getElementById("preva");
var nexta = document.getElementById("nexta");
function setHash(hash, section_id){
  if (link_count.hasOwnProperty(hash)) {
    if (link_count[hash] == section_id) {
      var prev = preva.pathname;
      if (preva.href != "") {
        if (hash > 1) {
          if (link_count.hasOwnProperty(hash - 1)) {
            prev = prev + "#" + (hash - 1);
            preva.href = prev;
          }
        }
      }
      if (nexta.href != "") {
        if (link_count.hasOwnProperty(hash + 1)) {
          var next = nexta.href + "#" + (hash + 1);
          nexta.href = next;
        }
      }
    }
  }
}

var refreshed = true;

r(function(){
  var fragment = 0;
  if (window.location.hash) { // URL Fragment exists
    fragment = parseInt(window.location.hash.replace("#", ""));
    if (!isNaN(fragment)) { //only using integers for URL fragment
      refreshed = false;
      var select_name = "section" + fragment;
      var activeSection = document.getElementsByName(select_name);
      if (activeSection.length > 0) {
        uncheck(activeSection[0], 'nav');
        activeSection[0].checked=true;
        if (document.querySelector(".selected")) {
          document.querySelector(".selected").classList.remove("selected");
        } else {
          console.log("NO PREVIOUSLY SELECTED SIDENAV LINK");
        }
        activeSection[0].classList.add("selected");
        crawlDOM(activeSection[0]);
      } else {
        refreshed = true;
      }
    }
  }
  var section_id = window.location.pathname;
  if (section_id.startsWith("/section/")) {
    var s_id = section_id.replace("/section/", "");
    s_id = s_id.split("/");
    if (!isNaN(s_id[0])) {
      section_id = s_id[0];
    }
  }
  else if (section_id.startsWith("/interviews/")) {
    section_id = "int" + section_id.replace("/interviews/","").replace("/", "");
  }
  if (refreshed) {
    var selected = document.getElementById(section_id);
    if (selected) {
      selected.classList.add("selected");
      crawlDOM(selected);
    }
  }
  let sidenav = document.querySelector(".sidenav");
  if (sessionStorage.getItem("scroll")) {
    sidenav.scrollTop = sessionStorage.getItem("scroll");
  }
  sidenav.classList.remove("notready"); 
  sidenav.classList.add("ready");
  menu.classList.add("animated");
  let currentState = history.state;
  if (currentState == null) {
    var scroll = document.querySelector(".sidenav").scrollTop;
    const state = { 'section': section_id + window.location.hash, 'scroll': scroll };
    const title = '';
    url = window.location.href;
    history.pushState(state, title, url);
  }
/*
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
*/
  if (fragment) {
    setHash(fragment, section_id);
  }
});

window.addEventListener('beforeunload', (event) => {
  sessionStorage.setItem("scroll", document.querySelector(".sidenav").scrollTop);
  return;
});

function pdf_search(term) {
  if (pdfs) {
    for(var i = 0; i < pdfs.length; i++) {
      if (pdfs[i].text.toLowerCase().includes(term.toLowerCase())) {
        console.log(i);
      }
    }
  }
}

let mql = window.matchMedia('(min-width: 60rem)');
var mq = window.matchMedia("(min-width: 1100px)");

function desktopMenu(mq) {
  if (!mq.matches) {
    sidemenu();
    if (document.getElementById("burg").classList.contains("is-active")) {
      document.getElementById("burg").classList.remove("is-active");
      if (menu.classList.contains("slide-in-left")) {
        console.log(menu.classList.contains("slide-in-left"));
      }
    }
  }
}

desktopMenu(mq);
var searchResults = document.getElementById("search-results");

function sidemenu() {
  if (mq.matches) {
    if (menu.classList.contains("slide-in-left")) {
      menu.classList.remove("slide-in-left");
      document.getElementById("burg").classList.remove("is-active");
    }
    else {
      menu.classList.add("slide-in-left");
      document.getElementById("burg").classList.add("is-active");   
    }
  } else {
    if (menu.classList.contains("slide-in-left")) {
      menu.classList.remove("slide-in-left");
      document.getElementById("burg").classList.remove("is-active");
    }
    else {
      menu.classList.add("slide-in-left");
      document.getElementById("burg").classList.add("is-active");   
    }
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
    var filename=imgs[i].src.split('/').pop();
    var classname = "imgc";
    if (filename.includes("-c.")) {
      classname = "imgc";
    } else if (filename.includes("-l.")) {
      classname = "imgl";
    } else if (filename.includes("-r.")) {
      classname = "imgr";
    }
    var formattedImg = 
      "<div class='" + classname + "'>" + 
        "<img src='" + imgs[i].src + "' alt='" + imgs[i].alt + "' title='" + imgs[i].title + "'>" + 
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
  if (event.state) {
    if (event.state.section) {
      var hash = 0;
      var section_id = event.state.section;
      var section_id_array = section_id.split("#");
      if (section_id_array.length > 1) {
        section_id = section_id_array[0];
        if (!isNaN(parseInt(section_id_array[1]))) {
          hash = parseInt(section_id_array[1]);         
        }
      }
      if (document.querySelector(".selected")) {
        document.querySelector(".selected").classList.remove("selected");
      }
      if (hash) {
        var select_name = "section" + hash;
        var activeSection = document.getElementsByName(select_name);
        if (activeSection.length > 0) {
          activeSection[0].checked=true;
          activeSection[0].classList.add("selected");
          crawlDOM(activeSection[0]);
        }
      } else {
        if (!document.getElementById(section_id)) {
          return false;
        }
        document.getElementById(section_id).classList.add("selected");
        crawlDOM(document.getElementById(section_id));
      }
      if (hash) {
        renderContent(section_id + "#" + hash);
        setHash(hash, section_id);
      } else {
        renderContent(section_id);
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

function renderContent(section_id) {
    //console.log("rendering " + section_id);
    var hash = 0;
    var section_id_array = section_id.split("#");
    if (section_id_array.length > 1) {
      section_id = section_id_array[0];
      if (!isNaN(parseInt(section_id_array[1]))) {
        hash = parseInt(section_id_array[1]);
      } 
    }
    let pagecontent = document.querySelector(".pagecontent");
    if (pagecontent) {
      pagecontent.parentElement.removeChild(pagecontent);
    }
    if (Object.keys(book_data).indexOf(section_id) == -1) {
      console.log("Invalid section id");
      return false; // handle history popstate on index / other pages
    }
    if (section_id == "/") {
      return false; // handle history popstate on index / other pages
    }
    document.querySelector("content").innerHTML = decode(book_data[section_id].content);
    formatImgs();
    document.getElementById("chapter-title").innerHTML = book_data[section_id].ch_title;
    var section_title = section_id + " " + book_data[section_id].title;
    if (book_data[section_id].appendix == "true") {
      section_title = book_data[section_id].title;
    }
    var canonical = window.location.origin;
    if (section_id.startsWith("int")) {
      section_title = book_data[section_id].title;
      canonical += "/interviews/" + section_id.replace("int","");
    } else {
      canonical += "/section/" + section_id + "/" + book_data[section_id].url + "/";
    }
    document.querySelector("link[rel='canonical']").setAttribute("href", canonical);
    document.getElementById("section-title").innerHTML = section_title;
    if (book_data[section_id].prev == "") {
      document.getElementById("prevwrap").classList.add("hide");  
      preva.href = "";
    }
    else {
      var prev = book_data[section_id].prev;
      preva.href = prev;
      document.getElementById("prevwrap").classList.remove("hide");
    }
    if (book_data[section_id].next == "") {
      document.getElementById("nextwrap").classList.add("hide");  
      nexta.href = "";
    }
    else {
      var next = book_data[section_id].next;
      nexta.href = next;
      document.getElementById("nextwrap").classList.remove("hide");
    }
    if (document.querySelector(".fn-spacer")) {
      if (document.querySelector(".fn-spacer").classList.contains("hide")) {
        document.querySelector(".fn-spacer").classList.remove("hide");
      }
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
}

function handleLink(e) {
  if (
    e.ctrlKey || 
    e.shiftKey || 
    e.metaKey || // apple
    (e.button && e.button == 1) // middle click, >IE9 + everyone else
  ){
    return; //allow links to open new tabs
  }
  var bubbled = e.target.closest("div");
  var proceed = 0;
  switch(bubbled.id) {
    case "nextwrap":
      proceed = 1;
      break;
    case "prevwrap":
      proceed = 2;
      break;
    default:
      if (e.target.tagName == "A") {
        proceed = 3;    
      }
  }
  if (proceed) {
    e.preventDefault();
    var url = "";
    var section_id = "";
    if (document.querySelector(".selected")) {
      document.querySelector(".selected").classList.remove("selected");
    }
    var hash = 0;
    switch(proceed) {
      case 1: //Next
        window.scrollTo(0,0); //scroll to top
        url = nexta.href;
        if (nexta.pathname.includes("interview")) {
          section_id = "int" + nexta.pathname.replace("/interviews/","").replace("/","");
        } else {
          let next_a = nexta.pathname.replace("/section/", "").split("/");
          section_id = next_a[0];
        } 
        var hash = parseInt(nexta.hash.replace("#", ""));
        if (!isNaN(hash)) {
          var activeSection = document.getElementsByName("section" + hash);
          if (activeSection.length > 0) {
            activeSection[0].checked=true;
            activeSection[0].classList.add("selected");
            crawlDOM(activeSection[0]);
          }
        } else {
          try {
            document.getElementById(section_id).classList.add("selected");
            crawlDOM(document.getElementById(section_id));
            hash = 0;
          }
          catch(err) {
            console.log(err);
            console.log("Erroneous section_id: " + section_id);
            section_id = section_id.replace("/","")
            document.getElementById(section_id).classList.add("selected");
            crawlDOM(document.getElementById(section_id));
            hash = 0;
          }
          document.getElementById(section_id).classList.add("selected");
          crawlDOM(document.getElementById(section_id));
          hash = 0;
        }
        break;
      case 2: //Prev
        window.scrollTo(0,0); //scroll to top
        url = preva.href;
        if (preva.pathname.includes("interview")) {
          section_id = "int" + preva.pathname.replace("/interviews/","").replace("/","");
        } else {
          section_id = preva.pathname.replace("/section/", "").split("/")[0];
        } 
        var hash = parseInt(preva.hash.replace("#", ""));
        if (!isNaN(hash)) {
          var activeSection = document.getElementsByName("section" + hash);
          if (activeSection.length > 0) {
            activeSection[0].checked=true;
            activeSection[0].classList.add("selected");
            crawlDOM(activeSection[0]);
          }
        } else {
          document.getElementById(section_id).classList.add("selected");
          crawlDOM(document.getElementById(section_id));        
          hash = 0;
        }
        break;
      case 3: //<a>
        var pathname = e.target.pathname;
        if ( pathname.startsWith("/section/")) {
          section_id = pathname.replace("/section/", "").split("/")[0];
        }
        else if (pathname.startsWith("/interviews/")){
          section_id = pathname.replace("/interviews/","").replace("/", "");
          section_id = "int" + section_id;
        }
        else { // remove this
          console.log("####################");
          console.log("Invalid section id / pathname");
          console.log(pathname);
          console.log("####################");
          return false;
        } 
        if (Object.keys(book_data).indexOf(section_id) == -1) {
          console.log('redirecting to ' + pathname);
          window.location.assign(pathname);
          return false;
        }
        e.target.classList.add("selected");
        e.target.blur();    
        if (e.target.hash) {
          hash = parseInt(e.target.hash.replace("#", ""));
          if (isNaN(hash)) {
            hash = 0;
          }
        }
        url = e.target.href;
        if (!mql.matches) {
          sidemenu();
        }
        break;
      default:
        return false;
    }
    if (hash) {
      renderContent(section_id + "#" + hash);
      setHash(hash, section_id);
    } else {
      renderContent(section_id);
    }
    var scroll = document.querySelector(".sidenav").scrollTop;
    const state = { 'section': section_id, 'scroll': scroll };
    const title = '';
    history.pushState(state, title, url.toLowerCase());
    window.scrollTo(0,0); //scroll to top
    return false;
  }
}

document.getElementById("nextwrap").addEventListener("click", handleLink, false);
document.getElementById("prevwrap").addEventListener("click", handleLink, false);
document.getElementById("expl").addEventListener("click", sidemenu, false);

var navList = document.querySelector(".nav__list");
for (var i=0; i < navList.childNodes.length; i++) {
  if (navList.childNodes[i].tagName == "LI") {
    for (var idx=0; idx < navList.childNodes[i].childNodes.length; idx++) {
      if (navList.childNodes[i].childNodes[idx].tagName == "INPUT") {
        navList.childNodes[i].addEventListener("click", handleLink, false);
      }
    } 
  }
}

document.onkeydown = function(e){
  if (e.code == "ArrowLeft") {
    if (!document.getElementById("prevwrap").classList.contains("hide")) {
      preva.click();
    }
  }
  if (e.code == "ArrowRight") {
    if (!document.getElementById("nextwrap").classList.contains("hide")) {
      nexta.click();
    }
  }
};

var searchbar = document.querySelector("input[name='search']");
document.getElementById("srch").addEventListener("click", function() {
  searchbar.focus();
});

document.getElementById("table-of-contents").onchange = function(){
  if (this.checked) {
    let pagecontent = document.querySelector(".pagecontent");
    if (pagecontent) {
      pagecontent.remove();
    }
    document.getElementById("chapter-title").innerHTML = toc.ch_title;
    document.getElementById("section-title").innerHTML = "";
    document.querySelector("content").innerHTML = decode(toc.content);
    document.getElementById("footnotes").innerHTML = "";
    document.getElementById("preva").href = "";
    document.getElementById("prevwrap").classList.add("hide");
    document.getElementById("nexta").href = "";
    document.getElementById("nextwrap").classList.add("hide");
  }
};
var topbutton = document.getElementById("topbtn");
var footer = document.querySelector("footer");
window.onscroll = function() {scrollFunction()};
function scrollFunction() {
  if (document.body.scrollTop > 700 || document.documentElement.scrollTop > 700) {
    topbutton.style.display = "flex";
    var position = footer.getBoundingClientRect();
    if(position.top < window.innerHeight && position.bottom >= 0) {
      let stickyspace = 30 + (window.innerHeight - position.top); 
      stickyspace = stickyspace + "px";
      topbutton.style.bottom = stickyspace;
    } else {
      topbutton.style.bottom = "30px";
    }
  } else {
    topbutton.style.display = "none";
  }
}
window.addEventListener('gesturechange', function() {});

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}