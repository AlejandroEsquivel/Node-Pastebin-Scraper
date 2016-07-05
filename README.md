# Node Pastebin Scraper
A rudimentary way to scrape recent pastes on pastebin without having an API key.

You can set expressions to search pastebin posts, set frequency of how often you want to run the scraper and for how long,
and also set an amount of time to wait between requests in order to prevent being temporarily blocked.

Moreover, the url's of the pastebin posts being scraped are recorded to avoid duplicate fetching when the scraper re-initiates.

# Parameters to set
Expressions [Array]
- List what keywords to search for
Seconds [Integer]
- How long to wait between requests
