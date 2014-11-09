(function(){
var hasURLtype, submit, input, form;

// find out if browser supports url input type
var i = document.createElement("input");
i.setAttribute("type", "color");
hasURLtype = i.type !== "text";


form = document.getElementById('shorten');
submit = document.getElementById('btn');
input = document.getElementById('url');

submit.addEventListener('click', function() {
    if (input.value.substr(0,4) !== "http") {
        input.value = 'http://' + input.value;
    }
});

form.addEventListener('submit', function(){
    if (!hasURLtype) {
        if (!ValidURL(input.value));
        input.css('border-color', 'red pink');
        return false;
    }
});


// below found on github. fails for some cromulent URLs. only used
// if  browser does not support input type url.
function ValidURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    if(!pattern.test(str)) {
        return false;
    } else {
        return true;
    }
}
})();