
function decode (str) {
    return str.replace(/&apos;/g, "'")
               .replace(/&quot;/g, '"')
               .replace(/&gt;/g, '>')
               .replace(/&lt;/g, '<')
               .replace(/&amp;/g, '&');
};

function highlight(input, text) {
  var indices = [];
  function mark(str, txt, idx) {
    idx = str.indexOf(txt, idx+txt.length);
    if (idx >= 0) {
      indices.push(idx);
      mark(str, txt, idx);
    }
  }
  var innerLower = input.toLowerCase();
  text_lower = text.toLowerCase();
  var index = innerLower.indexOf(text_lower);
  if (index >= 0) {
    indices.push(index);
    var formatted_html = "";
    formatted_html = input.substring(0,index);
    mark(innerLower, text, index);
    for (var i = 0; i < indices.length; i++) {
      let highlighted = "<mark>" + input.substring(indices[i],indices[i] + text.length) + "</mark>";
      if(typeof indices[i+1] === 'undefined') {
        highlighted += input.substring(indices[i] + text.length);
      } else {
        highlighted += input.substring(indices[i] + text.length, indices[i+1]);
      }
      formatted_html += highlighted;
    }
    return formatted_html;
  }
}

function srch(item, searchText) {
  var matched = false;
  var ch_title = "";
  var section = "";
  if (item[1].ch == "Interviews") {
    ch_title = "Interviews:";
  } else {
    ch_title = highlight(item[1].ch_title, searchText);
    if (ch_title) {
      matched = true;
    } else {
      ch_title= item[1].ch_title;
    }
    section = highlight(item[0], searchText);
    if (section) {
      matched = true;
    } else {
      section = item[0];
    }
  }
  
  var url = "/"
  if (item[0].startsWith("int")){
    url = "/interview/" + item[0].replace("int", "");
  } else {
    url = "/section/" + item[0];
  }
  var title = highlight(item[1].title, searchText);
  if (title) {
    matched = true;
    //title = "<h3>" + title + "</h3>";
  } else {
    //title = "<h3>" + item[1].title + "</h3>";
    title = item[1].title;
  }
  //var cntnt = item[1].content;
  //cntnt = cntnt.toLowerCase();
  //var content_index = cntnt.indexOf("https://archive.computerhistory.org/");
  //console.log(content_index); 
  //<a href="https://archive.computerhistory.org/resources/access/text/2013/05/102746645-05-01-acc.pdf">Norm Abramson Interviewed by James Pelkey 10/13/88</a>
  
  var content = "";
  var decoded_content = decode(item[1].content);
  var matched_img = "";
  var search_rx = new RegExp(searchText, "gi");
  if (search_rx.test(decoded_content)) {
    var a_rex = /<\s*a[^>]*>(.*?)<\s*\/\s*a>/g;
    var img_rex = /<img([\w\W]+?)\/>/g;
    var imgs = decoded_content.match(img_rex);

    var paragraphs = [];
    decoded_content = decoded_content.replace(a_rex, "").replace(img_rex, "").replace(/<p>*<\/p>/g, "");
    decoded_content.replace(/<p>(.*?)<\/p>/g, function () {
      paragraphs.push(arguments[1]);
    });
    if (imgs) {
      var prev_img_count = 0;
      for (var i=0; i<imgs.length; i++) {
        var img_match_count = (imgs[i].match(search_rx) || []).length;
        // search between tags using regex??
        if (img_match_count > 0 && img_match_count > prev_img_count) {
          prev_img_count = img_match_count;
          matched_img = imgs[i];
        }
      }   
    }
    if (matched_img) {
      matched = true;
      var img_dom = document.createElement('html');
      img_dom.innerHTML = matched_img;
      var shadow_img = img_dom.getElementsByTagName('IMG')[0]
      if (shadow_img) {
        if (shadow_img.src) {
          var classname = "imgl";
          /*
          var img_src = shadow_img.src.split("/").pop();
          if (img_src.includes("-c.")) {
            classname = "imgc";
          } else if (img_src.includes("-l.")) {
            classname = "imgl";
          } else if (img_src.includes("-r.")) {
            classname = "imgr";
          }
          */          
          var img_title = highlight(shadow_img.title, searchText);
          if (!img_title) {
            img_title = shadow_img.title;
          }
          if (img_title != "") {
            img_title = "<h3>" + img_title + "</h3>";
          }
          var formatted_img = 
            "<div class='" + classname + "'>" + 
              "<img src='" + shadow_img.src + "' alt='" + shadow_img.alt + "' >" + 
              img_title + 
            "</div>";
          matched_img = formatted_img;
        }
      }
    }
    var content = "";
    var search_count = 0;
    for (var i=0; i<paragraphs.length; i++) {
      if (paragraphs[i].toLowerCase().includes(text_lower)) {
        let sentences = paragraphs[i].split(/((?![.\n\s])[^.\n"]*(?:"[^\n"]*[^\n".]"[^.\n"]*)*(?:"[^"\n]+\."|\.|(?=\n)))/gi);
        for (var s=0; s<sentences.length; s++) {
          var count = (sentences[s].match(search_rx) || []).length;
          if (count > 0 && count > search_count) {
            search_count = count;
            content = sentences[s];
            if (content.startsWith('” ')) {
              content = content.replace('” ', '');
            }
            if (content.startsWith(", ")) {
              content = content.replace(", ", "");
            }
          }
        }
      }
    }
  }
  content = highlight(content, searchText);
  if (content) {
    matched = true;
    content = "<p>" + content + "</p>";
  } else {
    content = "";
  }
  if (matched) {
    var html = 
      `<div class="search-item">
        <h1>${ch_title}</h1>
        <h2>${section} ${title}</h2>
        ${content}
        ${matched_img}
      </div>`;
    return html;
  }
}

const searchJSON = searchText => {
  let html = "";
  if (searchText.length < 2) { // Clear when input or matches are empty
    hideResults();
  } else {
    showResults();
    html = search_array.map( item => srch(item, searchText) ).join('');
  }
  document.getElementById('results').innerHTML = html;
};

let timeout = null;
document.getElementById('search').addEventListener('keyup', function (e) {
  clearTimeout(timeout);
  timeout = setTimeout(function () {
    let html = "";
    let searchText = document.getElementById('search').value;
    if (searchText.length < 2) { // Clear when input or matches are empty
      hideResults();
    } else {
      showResults();
      html = search_array.map( item => srch(item, searchText) ).join('');
    }
    document.getElementById('results').innerHTML = html;
  }, 250);
});