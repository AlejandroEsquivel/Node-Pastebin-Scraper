# Node Pastebin Scraper
A rudimentary way to scrape recent pastes on pastebin without having an API key.

You can set expressions to search pastebin posts, set frequency of how often you want to run the scraper and for how long,
and also set an amount of time to wait between requests in order to prevent being temporarily blocked.

Moreover, the url's of the pastebin posts being scraped are recorded to avoid duplicate fetching when the scraper re-initiates.

# Parameters to set
- Expressions [array] keywords to search
- Frequency [object] determines how often scraper should re-start (reload new array of new pastes and scrape them), how long this program should run for, and how long to wait between http requests.

# Run in background
You can optionally install the npm package forever (npm install -g forever) and then let this scraper run.
This can be done by (forever start scraper.js), a log will be automatically generated (forever list) shows where the log is located

# Project setup
- Run 'npm install'
- Then 'npm start'
