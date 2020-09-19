
function decode (str) {
    return str.replace(/&apos;/g, "'")
               .replace(/&quot;/g, '"')
               .replace(/&gt;/g, '>')
               .replace(/&lt;/g, '<')
               .replace(/&amp;/g, '&');
};

function highlight(input, text, is_content=false) {
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
    if (is_content) {
      var decoded = decode(input);

      var search_rex = new RegExp(text, "gi");
      var a_rex = /<\s*a[^>]*>(.*?)<\s*\/\s*a>/g;
      var img_rex = /<img([\w\W]+?)\/>/g;
      var imgs = decoded.match(img_rex);

      var paragraphs = [];
      decoded = decoded.replace(a_rex, "").replace(img_rex, "").replace(/<p>*<\/p>/g, "");
      decoded.replace(/<p>(.*?)<\/p>/g, function () {
        paragraphs.push(arguments[1]);
      });
      var matches = [];
      if (imgs) {
        for (var i=0; i<imgs.length; i++) {
          if (imgs[i].toLowerCase().includes(text_lower)) {
            matches.push(imgs[i]);
          }
        }   
      }
      var matched_sentence = "";
      var search_count = 0;
      for (var i=0; i<paragraphs.length; i++) {
        if (paragraphs[i].toLowerCase().includes(text_lower)) {
          let sentences = paragraphs[i].split(/((?![.\n\s])[^.\n"]*(?:"[^\n"]*[^\n".]"[^.\n"]*)*(?:"[^"\n]+\."|\.|(?=\n)))/gi);
          for (var s=0; s<sentences.length; s++) {
            var count = (sentences[s].match(search_rex) || []).length;
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
      console.log(matched_sentence);
      formatted_html += "<p>" + matched_sentence + "</p>";
    }
    else {
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
    }
    return formatted_html;
  }
}

function srch(item, searchText) {
  console.log(item);
  var matched = false;
  var section = highlight(item[0], searchText);
  if (section) {
    matched = true;
    if (item[0].startsWith("int")) {
      //section = "<h1>Interview: " + section.replace("int", "") + "</h1>";
      section = "<h1>Interviews:</h1>";
    } else {
      section = "<h2>" + section + "</h2>";
    }
  } else {
    if (item[0].startsWith("int")) {
      //section = "<h1>Interview: " + item[0].replace("int", "") + "</h1>";
      section = "<h1>Interviews:</h1>";
    } else {
      section = "<h2>" + item[0] + "</h2>";
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
/*
  var chapter = highlight(item[1].ch, searchText);
  if (chapter) {
    matched = true;
    chapter = "<h2>Chapter: " + chapter + "</h2>";
  } else {
    chapter = "<h2>Chapter: " + item[1].ch + "</h2>";
  }
*/
  var ch_title = highlight(item[1].ch_title, searchText);
  if (ch_title) {
    matched = true;
    ch_title="<h1>" + ch_title + "</h1>";
  } else {
    ch_title="<h1>" + item[1].ch_title + "</h1>";
  }
  var cntnt = item[1].content;
  cntnt = cntnt.toLowerCase();
  //var content_index = cntnt.indexOf("https://archive.computerhistory.org/");
  //console.log(content_index); 
  //<a href="https://archive.computerhistory.org/resources/access/text/2013/05/102746645-05-01-acc.pdf">Norm Abramson Interviewed by James Pelkey 10/13/88</a>
  
  var content = highlight(item[1].content, searchText, true);
  if (content) {
    matched = true;
    //content = decode(content);
    //content = "<div class='search-content'>" + content + "</div>";
  } else {
    content = "";
  }
  if (matched) {
    var html = 
      `<div class="search-item">
        ${ch_title}
        ${section}
        ${title}
        ${content}
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