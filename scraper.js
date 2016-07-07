/*
  Author: Alejandro Esquivel
  Note: You can use this in any way you like. I do not take liability if you get banned from Pastebin, use responsibly ;)
  This can be used to detect breaches to your sites, or if your email address appears in a recent leak.
*/
var cheerio = require('cheerio');
var request = require('request');
var Repeat = require('repeat');
var sleep = require('sleep');
//require('request-debug')(request);
//-------- Params
var expressions = [/password/i,/ dump /i, /hotmail/i, /gmail/i, /yahoo/i,/hack/i, /leak/i, /db_pass/i, /db_password/i]; // each keyword case insensitive, /<keyword>/i
var frequency = {
  wait: 5, //second to wait before each request
  every: {
    unit: 'minutes',
    quantity: 3 // how often load recent pastes and scrape them
  },
  for:{
    unit: 'minutes',
    quantity: 120 // how long to continue scraping pastebin
  },
  start: {
    unit: 'sec',
    quantity: 0 // how long until scraper starts
  }
}
var logging = true; // Log the Pastebin ID each time before scraping contents.
var log = [];
var callback = function(url,html,raw,firstKeywordFound,time){ // define callback when paste found that matches expressions.
  var pasteId = url.split('/')[1];
  var msg = 'Found keyword: '+firstKeywordFound+', posted: '+time+', at '+url;
  console.log(msg);
  log.push(msg);
}

//--- End params
var known = [];
var keyword = ''; // you can ignore this.
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
      var url = {},params={},raw={},time="";
      for(var i=1;i<size;i++){
        if(parent.eq(i).children('td').eq(0).find('a').attr('href')){
          url = parent.eq(i).children('td').eq(0).find('a').attr('href').split('/')[1];
          time = parent.eq(i).children('td').eq(1).html();
          if(!known.find(search,url)){
            known.push(url);
            (logging? console.log("URL: "+url):'');
            sleep.sleep(frequency.wait);
            request.get({url:'http://pastebin.com/'+url+'/',qs:{time:time}}, function(err,response,body){
              if(err){
                console.log('Error:', err);
              }
              var filter = (body ? (match(body)): false);
              if(filter && response.req){
                var paste = response.req.path.split('/')[1];
                var time = response.req.path.split('?time=')[1];
                callback('pastebin.com/'+paste+'/',body,$('#paste_code').eq(0).html(),keyword,time);
              }
              sleep.sleep(1);
            });
          }
          else {
            console.log("Skipped URL: "+url);
          }
        }
      }
      console.log('Restarting scraper...');
    });
};
Repeat(init).every(frequency.every.quantity, frequency.every.unit).for(frequency.for.quantity, frequency.for.unit).start.in(frequency.start.quantity, frequency.start.unit);
console.log('Running Pastebin Scraper...');
