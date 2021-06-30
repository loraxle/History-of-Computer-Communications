
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
  var footnotes = "";
  var title_matched = false;
  var section_matched = false;
  var p_matched = false;
  var img_matched = false;
  var is_interview = false;
  var fn_matched = false;
  var url = "/"
  if (item[0].startsWith("int")){
    url = "/interviews/" + item[0].replace("int", "");
  } else {
    url = "/section/" + item[0] + "/" + item[1].url + "/";
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
          var classname = "imgc";         
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
  if (item[1].footnotes !== undefined) {
    var matched_fn = item[1].footnotes.filter(obj => obj.src.toLowerCase().indexOf(searchText.toLowerCase()) >= 0);
    var fn_size = Object.keys(matched_fn).length;
    if (fn_size) {
      matched = true;
      fn_matched = true;
      footnotes = matched_fn.map(footnote => {
        let found_fn = highlight(footnote.src.replace(/(<([^>]+)>)/ig, ""), searchText);
        if (found_fn !== undefined) {
          return `<p><span>[${footnote.num}]</span> : ${found_fn}</p>`;
        }
      });
    }
  }
  if (matched) {
    //console.log("\n\n" + section);
    var search_item = {};
    if (Object.keys(footnotes).length > 0) {
      let footnotes_str = footnotes.join("");
      footnotes = footnotes_str;
      footnotes = `<div class="footnote"><div>Footnotes:</div>${footnotes}</div>`
    } else {
      footnotes = "";
    }
    var html = 
      `<a href="${url}" class="search-item"><h1>${ch_title}</h1><h2>${section} ${title}</h2>${content}${matched_img}${footnotes}</a>`;
    if (is_interview) {
      if (title_matched) {
        //console.log("int title matched");
        search_item.interview = [html];
      } else {
        search_item.interviews = [html];
        //console.log("int no title matched");
      }
    }
    else if (section_matched || title_matched) {
      search_item.h2 = html;
      //console.log("non-int section/title matched");
    } else if (p_matched && !section_matched && !title_matched) {
      search_item.p = [html];
      //console.log("p matched");
    } else if (img_matched && !section_matched && !title_matched && !p_matched) {
      search_item.img = [html];
      //console.log("img matched");
    } else if (fn_matched && !section_matched && !title_matched && !p_matched && !img_matched && footnotes != "") {
      //console.log("footnotes matched");
      search_item.footnotes = html;
      //console.log(html);
      //console.log(footnotes);
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
        "interview" : [],
        "interviews" : [],
        "p" : [],
        "img" : [],
        "footnotes" : []
      };
      for (var i=1; i<search_array.length; i++) { // offset first entry for toc
        let search_query = srch(search_array[i], searchText);
        if (search_query) {
          if (search_query.h2){
            search_results.h2.push(search_query.h2);
          }
          if (search_query.interview){
            search_results.interview.push(search_query.interview);
          }
          if (search_query.interviews){
            search_results.interviews.push(search_query.interviews);
          }
          if (search_query.p){
            search_results.p.push(search_query.p);
          }
          if (search_query.img){
            search_results.img.push(search_query.img);
          }
          if (search_query.footnotes){
            search_results.footnotes = search_results.footnotes.concat(search_query.footnotes);
          }
        }
      }
      //console.log(search_results);
      html = search_results.h2.join("");
      if (search_results.interview.length > 0) {
        html += "<div class='search-item'><h1>Interviews:</h1></div>";
        html += search_results.interview.join("");
      }
      html += search_results.p.join("");
      html += search_results.img.join("");
      if (search_results.interviews.length > 0) {
        html += "<div class='search-item'><h1>Interviews:</h1></div>";
        html += search_results.interviews.join("");
      }
      if (search_results.footnotes.length > 0) {
        //html += search_results.footnotes;
        html += search_results.footnotes.join("");
        //console.log(search_results.footnotes);
      }
    }
    document.getElementById('results').innerHTML = html;
  }, 250);
});