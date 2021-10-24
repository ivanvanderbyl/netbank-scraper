# NetBank Scraper

A simple and understandable scraper for retrieving your transactions from within Commonwealth Bank's Netbank UI.

## How it works

Under the hood, this scraper uses Puppeteer to log-in to a Netbank account using the provided Client ID and Password, and then intercepts the network requests that return the accounts, transactions, and download feeds. The end result is a clean output in CSV or JSON depending on what you need it for. This tool is designed to run in Docker and feed results to an external service for further processing, in this case [LunchMoney](https://lunchmoney.app/).

> SECURITY NOTE: Be very careful with exposing your Netbank credentials, never add them to git, and always enable MFA on your account to disable transfers if something goes terribly wrong security-wise with wherever you end up deploying this.
> No warranties are implied, by using this repo you understand the risks and have done an analysis of the dependencies used herein.

## Status:

- [x] Login
- [x] Accounts list
- [ ] Transactions (partially complete, needs pagination token)
- [ ] Download of transactions for given date range
- [ ] Export to LunchMoney

## Usage

```shell
TBD

```

## License

MIT
