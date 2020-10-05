function netlifyForm(form) {
  var formdata = new FormData(form);
  var xhr = new XMLHttpRequest();
  xhr.open('POST', form.action, true);  
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        for (var i = 0, input; input = form.elements[i++];) {
          if (input.tagName == "INPUT" && input.type != "submit") {
            input.value = "";
          }
        }
        document.getElementById("contact-send").innerHTML = "<h2>Thanks for contacting us!</h2>";
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function (e) {
    console.error(xhr.statusText);
  };
  xhr.send(formdata);
}
document.querySelector("form[name='contact']").onsubmit = function(e){
  e.preventDefault();
  netlifyForm(e.target);
};