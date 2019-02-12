import PasteBinScraper from './src/index';

const scraper = new PasteBinScraper();


const expressions = [/password/i, / dump /i, /hotmail/i, /gmail/i, /yahoo/i, /hack/i, /leak/i, /db_pass/i, /db_password/i];

scraper.setExpressionsToMatch(expressions);

scraper.Repeat().every(5, 'minutes').start.now();

scraper.on('match',(paste)=>{
    console.log(`Matched paste! URL (${paste.url} , posted: ${paste.timePosted}`)
});