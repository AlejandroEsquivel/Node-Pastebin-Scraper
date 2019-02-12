import EventEmitter from 'events';
import cheerio from 'cheerio';
import request from 'request-promise';
import Repeat from 'repeat';
import q from 'q';

export default class PasteBinScraper extends EventEmitter {

    constructor(config) {
        super();
        this.history = {};
        this.config = config || {};
        this.expressionsToMatch = [];

        this.defaultMatchCondition = (paste) =>
            this.expressionsToMatch.length && 
            this.expressionsToMatch
                .reduce((orChain,expression)=>orChain || paste.body.match(expression),false);

        this.setMatchCondition(this.defaultMatchCondition.bind(this));
    }

    setExpressionsToMatch(expressions){
        this.expressionsToMatch = expressions;
    }

    setMatchCondition(fn){
        if(typeof fn !== 'function'){return;}
        this._matchCondition = fn;
    }

    Repeat(){
        return Repeat(this.scrape.bind(this));
    }

    pasteHandler(paste) {
        const _self = this;
        return request.get({ url: `http://pastebin.com/${paste.url}/` }).then((body) => {

            const $ = cheerio.load(body);

            paste.body = $('#paste_code').val(); // raw paste body
            paste.url = `http://pastebin.com/${paste.url}/`;

            if(_self._matchCondition(paste)) {
                this.emit('match', paste);
            }
        })

    }

    scrape() {

        const _self = this;

        return request.get({ url: 'http://pastebin.com/archive' }).then((body) => {
            const $ = cheerio.load(body);
            const parent = $('#content_left').find('table').children('tr');


            let promiseChain = q.Promise((resolve) => resolve(false));

            parent.each(function IteratingOverPastes(i, elem) {

                let paste = {};

                let child = $(this);

                if (child.children('td').eq(0).find('a').attr('href')) {

                    paste.url = child.children('td').eq(0).find('a').attr('href').split('/')[1];
                    paste.timePosted = child.children('td').eq(1).html();

                    if (!_self.history[paste.url]) {

                        _self.history[paste.url] = 1;

                        promiseChain = promiseChain.then(() =>
                            q.delay(_self.config.eachPasteWait || 5000)
                                .then(() => _self.pasteHandler(paste)));

                    }
                }
            });

            return promiseChain;

        })

    }
}