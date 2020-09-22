
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
  var content = "";
  var ch_title = "";
  var section = "";
  var title_matched = false;
  var section_matched = false;
  var p_matched = false;
  var img_matched = false;
  var is_interview = false;
  var url = "/"
  if (item[0].startsWith("int")){
    url = "/interview/" + item[0].replace("int", "");
  } else {
    url = "/section/" + item[0];
  }
  if (item[1].ch == "Interviews") {
    is_interview = true;
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
      section_matched = true;
    } else {
      section = item[0];
    }
  }
  var title = highlight(item[1].title, searchText);
  if (title) {
    matched = true;
    title_matched = true;
  } else {
    title = item[1].title;
  }
  //var cntnt = item[1].content;
  //cntnt = cntnt.toLowerCase();
  //var content_index = cntnt.indexOf("https://archive.computerhistory.org/");
  //console.log(content_index); 
  //<a href="https://archive.computerhistory.org/resources/access/text/2013/05/102746645-05-01-acc.pdf">Norm Abramson Interviewed by James Pelkey 10/13/88</a>
  
  var matched_sentence = "";
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
          img_matched = true;
        }
      }
    }
    var search_count = 0;
    for (var i=0; i<paragraphs.length; i++) {
      if (paragraphs[i].toLowerCase().includes(text_lower)) {
        let sentences = paragraphs[i].split(/((?![.\n\s])[^.\n"]*(?:"[^\n"]*[^\n".]"[^.\n"]*)*(?:"[^"\n]+\."|\.|(?=\n)))/gi);
        for (var s=0; s<sentences.length; s++) {
          var count = (sentences[s].match(search_rx) || []).length;
          if (count > 0 && count > search_count) {
            search_count = count;
            matched_sentence = sentences[s];
            if (matched_sentence.startsWith('” ')) {
              matched_sentence = matched_sentence.replace('” ', '');
            }
            if (matched_sentence.startsWith(", ")) {
              matched_sentence = matched_sentence.replace(", ", "");
            }
          }
        }
      }
    }
  }
  content = highlight(matched_sentence, searchText);
  if (content) {
    matched = true;
    p_matched = true;
    content = "<p>" + content + "</p>";
  } else {
    content = "";
  }
  if (matched) {
    var search_link = "<a href='" + url + "'>";
    var search_item = {};
    var html = 
      `<a href="${url}" class="search-item">
        <h1>${ch_title}</h1>
        <h2>${section} ${title}</h2>
        ${content}
        ${matched_img}</a>`;
    //return html;
    if (is_interview) {
      search_item.interview = [html];      
    }
    else if (section_matched || title_matched) {
      search_item.h2 = html;
    } else if (p_matched && !section_matched && !title_matched) {
      search_item.p = [html];
    } else if (img_matched && !section_matched && !title_matched && !p_matched) {
      search_item.img = [html];
    }	
    return search_item;
  }
}

let search_timeout = null;
document.getElementById('search').addEventListener('keyup', function (e) {
  clearTimeout(search_timeout);
  search_timeout = setTimeout(function () {
    let html = "";
    let searchText = document.getElementById('search').value;
    if (searchText.length < 2) { // Clear when input or matches are empty
      hideResults();
    } else {
      showResults();
      var search_results = {
        "h2" : [],
        "interviews" : [],
        "p" : [],
        "img" : []
      };
      for (var i=0; i<search_array.length; i++) {
        let search_query = srch(search_array[i], searchText);
        if (search_query) {
          if (search_query.h2){
            search_results.h2.push(search_query.h2);
          }
          if (search_query.interview){
            search_results.interviews.push(search_query.interview);
          }
          if (search_query.p){
            search_results.p.push(search_query.p);
          }
          if (search_query.img){
            search_results.img.push(search_query.img);
          }
        }
      }
      html = search_results.h2.join("");
      if (search_results.interviews.length > 0) {
        html += "<div class='search-item'><h1>Interviews:</h1></div>";
        html += search_results.interviews.join("");
      }
      html += search_results.p.join("");
      html += search_results.img.join("");
    }
    document.getElementById('results').innerHTML = html;
  }, 250);
});