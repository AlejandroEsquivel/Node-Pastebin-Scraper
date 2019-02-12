# Node Pastebin Scraper

# Setup

## Install 
Install dependencies

```npm i```

## Build

Build the files, the output will be in the folder `dist`. You can import `dist/index.js` for non ES6 class compatible enviroments.

```npm run build```

## Use example.js

You need nodemon for this.

```npm i -g nodemon```

Run the example as in example.js

```npm run example```


# Usage: Basic 

You can define an array of regex expressions to be matched to each paste's body, the scraper will run through the most recent posted 'pastes' on PasteBin once.

```javascript
import PasteBinScraper from './src/index';

//wait 5 seconds before scanning the next paste (default time - recommended).
const scraper = new PasteBinScraper({ eachPasteWait: 5000 });


const expressions = [/password/i, / dump /i, /hotmail/i, /gmail/i, /yahoo/i, /hack/i, /leak/i, /db_pass/i, /db_password/i, /href/i, /class/i];

scraper.setExpressionsToMatch(expressions);

scraper.scrape()
    .then(()=>console.log('Finished Scraping recent pastes!'))
    .catch((e)=>console.error(e));

scraper.on('match',(paste)=>{
    console.log(`Matched paste! URL (${paste.url} , posted: ${paste.timePosted}`)
})
```

## Usage: Poll Recent Pastes Continously

`scraper.Repeat()` exposes (https://www.npmjs.com/package/repeat) a Repeat object, which will scrape PasteBin as per it's configuration.

Note: Repeat is not being maintained anymore, so not recommended for Production use cases.

```javascript
import PasteBinScraper from './src/index';

const scraper = new PasteBinScraper();


const expressions = [/password/i, / dump /i, /hotmail/i, /gmail/i, /yahoo/i, /hack/i, /leak/i, /db_pass/i, /db_password/i, /href/i, /class/i];

scraper.setExpressionsToMatch(expressions);

// under 3 minutes not recommended
scraper.Repeat().every(3, 'minutes').for(120, 'minutes');

scraper.on('match',(paste)=>{
    console.log(`Matched paste! URL (${paste.url} , posted: ${paste.timePosted}`)
})
```

# API

## constructor(ConfigurationObject)

### ConfigurationObject.eachPasteWait

The only available configuration at this time is how long to wait before scanning the next paste.

```javascript
const scraper = new PasteBinScraper({ eachPasteWait: 5000 });
```

## scrape()

Starts scraping process, that is, look at Pastebin's recent pastes and iterate through each of them then emit the event `match` when the match condition is met.

Returns a promise that is resolved when the list of recent pastes has been iterated.

```javascript
scraper.scrape();
```

## setMatchCondition(Function)

You can customize what condition should be met when iterating through each paste by supplying a handler, the object 'paste' is passed which contains the attributes: `url`, `postedTime`, `body`

By default the match condition is just iterates through a set of regex expressions (set by `setExpressionsToMatch`) to ensure at least there is one match, before emitting the 'match' event.

```javascript
// This example replaces the match condition for all scraping purposes

// If any paste satisfies this condition, 'match' will be emitted.

const handler = (paste)=>{
    let { url, postedTime, body } = paste;
    return body.match(/database/i)
}
scraper.setMatchCondition(handler);
```

## setExpressionsToMatch(Array)

Sets an array of Regular Expressions that will need to be matched with a paste's body, assuming `setMatchCondition` has not been called (i.e the default match condition has not been replaced).

```javascript
scraper.setExpressionsToMatch([/(password|pass)/i,/dralejandro/i]);
```

## Repeat()

Exposes (https://www.npmjs.com/package/repeat) a `Repeat` object, which will scrape PasteBin as per it's configuration.

```javascript
scraper.Repeat().every(3, 'minutes').for(120, 'minutes');
```

## on(EventString, Handler)

### EventString: 'match'

This event is passed a `paste` object which contains the attributes: `url`, `postedTime`, `body`;

```javascript
 scraper.on('match',(paste)=>{
     //do something
 })
```
