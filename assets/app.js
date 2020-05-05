var book_data = {};
function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}

function setHash(hash, section_id){
  if (count.hasOwnProperty(hash)) {
    if (count[hash] == section_id) {
      var preva = document.getElementById("preva");
      var prev = preva.pathname;
      if (preva.href != "") {
        if (hash > 1) {
          if (count.hasOwnProperty(hash - 1)) {
            prev = prev + "#" + (hash - 1);
            preva.href = prev;
          }
        }
      }
      var nexta = document.getElementById("nexta");
      if (nexta.href != "") {
        if (count.hasOwnProperty(hash + 1)) {
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
          document.querySelector(".selected").classList.remove("selected");
          activeSection[0].classList.add("selected");
          crawlDOM(activeSection[0]);
        } else {
          refreshed = true;
        }
      }
    }
    if (refreshed) {
      var selected = document.querySelector(".selected");
      if (selected) {
        crawlDOM(selected);
      }
    }
    let sidenav = document.querySelector(".sidenav");
    if (sessionStorage.getItem("scroll")) {
      sidenav.scrollTop = sessionStorage.getItem("scroll");
    }
    sidenav.classList.remove("notready"); 
    sidenav.classList.add("ready");
    var section_id = window.location.pathname.replace("/History-of-Computer-Communications/section/","").replace("/", "");
    let currentState = history.state;
    if (currentState == null) {
      var scroll = document.querySelector(".sidenav").scrollTop;
      const state = { 'section': section_id + window.location.hash, 'scroll': scroll };
      const title = '';
      url = window.location.href;
      history.pushState(state, title, url);
    }
    getJSON()
    .then(JSON.parse)
    .then(function(response) {
        book_data = response;
        if (fragment) {
          setHash(fragment, section_id);
        }
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
    if (section_id == "History-of-Computer-Communications/") {
      return false; // handle history popstate on index / other pages
    }
    document.querySelector("content").innerHTML = decode(book_data[section_id].content);
    formatImgs();
    document.getElementById("chapter-title").innerHTML = book_data[section_id].ch_title;
    document.getElementById("section-title").innerHTML = section_id + " " + book_data[section_id].title;
    if (book_data[section_id].prev == "") {
      document.getElementById("prevwrap").classList.add("hide");  
      document.getElementById("preva").href = "";
    }
    else {
      var prev = "/History-of-Computer-Communications" + book_data[section_id].prev;
      document.getElementById("preva").href = prev;
      document.getElementById("prevwrap").classList.remove("hide");
    }
    if (book_data[section_id].next == "") {
      document.getElementById("nextwrap").classList.add("hide");  
      document.getElementById("nexta").href = "";
    }
    else {
      var next = "/History-of-Computer-Communications" + book_data[section_id].next;
      document.getElementById("nexta").href = next;
      document.getElementById("nextwrap").classList.remove("hide");
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
    var canonical = window.location.origin + "/History-of-Computer-Communications/section/" + section_id;
    document.querySelector("link[rel='canonical']").setAttribute("href", canonical);
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
        url = document.getElementById("nexta").href;
        section_id = document.getElementById("nexta").pathname.replace("/History-of-Computer-Communications/section/","").replace("/","");
        var hash = parseInt(document.getElementById("nexta").hash.replace("#", ""));
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
      case 2: //Prev
        url = document.getElementById("preva").href;
        section_id = document.getElementById("preva").pathname.replace("/History-of-Computer-Communications/section/","").replace("/","");
        var hash = parseInt(document.getElementById("preva").hash.replace("#", ""));
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
        section_id = e.target.pathname.replace("/History-of-Computer-Communications/section/","").replace("/", "");
        if (Object.keys(book_data).indexOf(section_id)) {
          window.location.assign(e.target.pathname);
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
    history.pushState(state, title, url);
    return false;
  }
}

document.getElementById("nextwrap").addEventListener("click", handleLink, false);
document.getElementById("prevwrap").addEventListener("click", handleLink, false);
document.getElementById("expl").addEventListener("click", sidemenu, false);
document.getElementById("srch").addEventListener("click", showResults, false);

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

document.onkeydown = function(e){
  if (e.code == "ArrowLeft") {
    if (!document.getElementById("prevwrap").classList.contains("hide")) {
      document.getElementById("preva").click();
    }
  }
  if (e.code == "ArrowRight") {
    if (!document.getElementById("nextwrap").classList.contains("hide")) {
      document.getElementById("nexta").click();
    }
  }

};