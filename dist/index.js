'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _repeat = require('repeat');

var _repeat2 = _interopRequireDefault(_repeat);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PasteBinScraper = function (_EventEmitter) {
    _inherits(PasteBinScraper, _EventEmitter);

    function PasteBinScraper(config) {
        _classCallCheck(this, PasteBinScraper);

        var _this = _possibleConstructorReturn(this, (PasteBinScraper.__proto__ || Object.getPrototypeOf(PasteBinScraper)).call(this));

        _this.history = {};
        _this.config = config || {};
        _this.expressionsToMatch = [];

        _this.defaultMatchCondition = function (paste) {
            return _this.expressionsToMatch.length && _this.expressionsToMatch.reduce(function (orChain, expression) {
                return orChain || paste.body.match(expression);
            }, true).bind(_this);
        };

        _this.setMatchCondition(_this.defaultMatchCondition);
        return _this;
    }

    _createClass(PasteBinScraper, [{
        key: 'setExpressionsToMatch',
        value: function setExpressionsToMatch(expressions) {
            this.expressionsToMatch = expressions;
        }
    }, {
        key: 'setMatchCondition',
        value: function setMatchCondition(fn) {
            if (typeof fn !== 'function') {
                return;
            }
            this._matchCondition = fn;
        }
    }, {
        key: 'Repeat',
        value: function Repeat() {
            return (0, _repeat2.default)(this.scrape);
        }
    }, {
        key: 'pasteHandler',
        value: function pasteHandler(paste) {
            var _this2 = this;

            var _self = this;
            console.log('Requesting paste ' + paste.url + '...');
            return _requestPromise2.default.get({ url: 'http://pastebin.com/' + paste.url + '/' }).then(function (body) {

                paste.body = body;
                paste.url = 'http://pastebin.com/' + paste.url + '/';

                if (_self._matchCondition(paste)) {
                    _this2.emit('match', paste);
                }
            });
        }
    }, {
        key: 'scrape',
        value: function scrape() {

            var _self = this;

            return _requestPromise2.default.get({ url: 'http://pastebin.com/archive' }).then(function (body) {
                var $ = _cheerio2.default.load(body);
                var parent = $('#content_left').find('table').children('tr');

                var promiseChain = _q2.default.Promise(function (resolve) {
                    return resolve(false);
                });

                parent.each(function IteratingOverPastes(i, elem) {

                    var paste = {};

                    var child = $(this);

                    if (child.children('td').eq(0).find('a').attr('href')) {

                        paste.url = child.children('td').eq(0).find('a').attr('href').split('/')[1];
                        paste.timePosted = child.children('td').eq(1).html();

                        if (!_self.history[paste.url]) {

                            _self.history[paste.url] = 1;

                            console.log("URL: " + paste.url);

                            promiseChain = promiseChain.then(function () {
                                return _q2.default.delay(_self.config.eachPasteWait || 5000).then(function () {
                                    return _self.pasteHandler(paste);
                                });
                            });
                        }
                    }
                });

                return promiseChain;
            });
        }
    }]);

    return PasteBinScraper;
}(_events2.default);

exports.default = PasteBinScraper;