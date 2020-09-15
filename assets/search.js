
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
  text = text.toLowerCase();
  var index = innerLower.indexOf(text);
  if (index >= 0) {
    indices.push(index);
    var formatted_html = input.substring(0,index);
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
  var section = highlight(item[0], searchText);
  if (section) {
    matched = true;
    if (item[0].startsWith("int")) {
      section = "<h1>Interview: " + section.replace("int", "") + "</h1>";
    } else {
      section = "<h1>Section: " + section + "</h1>";
    }
  } else {
    if (item[0].startsWith("int")) {
      section = "<h1>Interview: " + item[0].replace("int", "") + "</h1>";
    } else {
      section = "<h1>Section: " + item[0] + "</h1>";
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
    title = "<h3>" + title + "</h3>";
  } else {
    title = "<h3>" + item[1].title + "</h3>";
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
  console.log(decode(item[1].content));
  var cntnt = item[1].content;
  cntnt = cntnt.toLowerCase();
  var content_index = cntnt.indexOf("https://archive.computerhistory.org/");
  //console.log(content_index); 
  //<a href="https://archive.computerhistory.org/resources/access/text/2013/05/102746645-05-01-acc.pdf">Norm Abramson Interviewed by James Pelkey 10/13/88</a>
  var content = highlight(item[1].content, searchText);
  if (content) {
    matched = true;
    //content = decode(content);
    //content = "<div class='search-content'>" + content + "</div>";
  } else {
    content = "";
  }
  if (matched) {
    var html = 
      `<a href="${url}" class="search-item">
        ${ch_title}
        ${section}
        ${title}
      </a>`;
    return html;
  }
}

const searchJSON = searchText => {
  if (searchText.length === 0) { // Clear when input or matches are empty
    hideResults();
    document.getElementById('results').innerHTML = '';
  } else {
    showResults();
  }
  const html = search_array.map( item => srch(item, searchText) ).join('');
  document.getElementById('results').innerHTML = html;
};

document.getElementById('search').addEventListener('input', () => searchJSON(document.getElementById('search').value));