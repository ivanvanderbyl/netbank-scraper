import { AutomatedPage } from './src/page'

const USERNAME = process.env.NETBANK_CLIENT_NUMBER || ''
const PASSWORD = process.env.NETBANK_PASSWORD || ''

async function main() {
  let netbank = new AutomatedPage()
  await netbank.start({ headless: true })
  await netbank.login(USERNAME, PASSWORD)
  await netbank.screenshot('login')
  const accounts = await netbank.collectAccounts()
  console.dir(accounts, { depth: null })
  let transactions = await netbank.fetch(
    'https://www.commbank.com.au/retail/netbank/accounts/api/transactions?account=MAhHTzJjNFUxaG5SK1dPVUZyVEttK3E0NWZ5Tm0xRU9SSWdnQ0ZJWWRPbDlsSVV3PT1m6n5%2BjucD7Hw8Ygxkf3r%2FHIFKgHRU6kRl%2Btv66QdCJ7dF9gJiVJuBdakpfzey%2Fji0L7sfEfrNO5Pcf6FtodwxYrWM9ZmntlE%3D&pagingKey=QzZERjNFMDdDMDAzMUVEQkJEOTAzQTdCN0JFNERDRjYsMDAxLDIwMjEtMDgtMDQsNTAzNy41NSxBVUQsQ1IsMjAyMTA4MDMxNzQwMDAuNzUwNjkzMSxTQVAsMjAxMC0xMC0yOQ%3D%3D',
  )

  console.dir(transactions, { depth: null })

  // await netbank.stop()
}

main()
