var cheerio = require('cheerio');
var request = require('request');
var Repeat = require('repeat');
var sleep = require('sleep');
var known = [];
var seconds = 5; // time to wait until fetching next paste
var keyword = '';
var expressions = [/hack/i, /hotmail/i, /gmail/i, /yahoo/i, /magnet/i]; // each keyword case insensitive, /<keyword>/i
var match = function(string) {
    var size = expressions.length,i = 0;
    for (; i < size; i++) {
        if (string.match(expressions[i])) {
          keyword = expressions[i];
            return true;
        }
    }
    return false;
};
var search = function(url){
  return url==this;
}
var init = function(){
    request.get({url:'http://pastebin.com/archive'}, function(err,httpResponse,body){
      var $ = cheerio.load(body);
      var parent = $('#content_left').find('table').children('tr');
      var size = parent.length;
      var url = {},params={},raw={};
      for(var i=1;i<size;i++){
        if($('#content_left').find('table').children('tr').eq(i).children('td').eq(0).find('a').attr('href')){
          url = $('#content_left').find('table').children('tr').eq(i).children('td').eq(0).find('a').attr('href').split('/')[1];
          console.log("URL: "+url);
          params.url = 'http://pastebin.com/'+url+'/';
          params.qs = {url:url};
          if(!known.find(search,'s')){
            known.push(url);
            request.get(params, function(err,response,body){
              var search = (body ? (match(body)): false);
              if(search){
                console.log('Found '+keyword);
                $ = cheerio.load(body); // html of paste page
                raw = $('#paste_code').eq(0).html(); // raw paste content
                console.log('pastebin.com'+response.request.url.pathname); // url of paste

              }
              return false;
            });
            //return false;
          }
          else {
            console.log("Skipped URL: "+url);
          }
        }
        sleep.sleep(seconds);
      }
    });
};
Repeat(init).every(5, 'minutes').for(120, 'minutes').start.in(0, 'sec');
console.log('Pastebin trends searcher');
