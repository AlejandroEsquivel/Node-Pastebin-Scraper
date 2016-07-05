/*
  Author: Alejandro Esquivel
  Note: You can use this in any way you like. I do not take liability if you get banned from Pastebin, use responsibly ;)
*/
var cheerio = require('cheerio');
var request = require('request');
var Repeat = require('repeat');
var sleep = require('sleep');
//-------- Params
var expressions = [/dump/i, /@hotmail/i, /@gmail/i, /@yahoo/i]; // each keyword case insensitive, /<keyword>/i
var frequency = {
  wait: 5, //second to wait before each request
  every: {
    unit: 'minutes',
    quantity: 5 // how often load recent pastes and scrape them
  },
  for:{
    unit: 'minutes',
    quantity: 120 // how long to continue scraping pastebin
  },
  start: {
    unit: 'sec',
    quantity: 5 // how long until scraper starts
  }
}
var logging = false; // Log the Pastebin ID each time before scraping contents.
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
      var url = {},params={},raw={};
      for(var i=1;i<size;i++){
        if($('#content_left').find('table').children('tr').eq(i).children('td').eq(0).find('a').attr('href')){
          url = $('#content_left').find('table').children('tr').eq(i).children('td').eq(0).find('a').attr('href').split('/')[1];
          (logging? console.log("URL: "+url):'');
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
          }
          else {
            console.log("Skipped URL: "+url);
          }
        }
        sleep.sleep(frequency.wait);
      }
    });
};
Repeat(init).every(frequency.every.quantity, frequency.every.unit).for(frequency.for.quantity, frequency.for.unit).start.in(frequency.start.quantity, frequency.start.unit);
console.log('Running Pastebin Scraper...');
