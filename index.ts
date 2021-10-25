import { AutomatedPage } from './src/page'
const USERNAME = process.env.NETBANK_CLIENT_NUMBER || ''
const PASSWORD = process.env.NETBANK_PASSWORD || ''

async function main() {
  let netbank = new AutomatedPage()
  console.log('===> Fetching accounts')
  await netbank.start({ headless: true })
  console.log('---> Logging in...')
  await netbank.login(USERNAME, PASSWORD)
  const accounts = await netbank.collectAccounts()
  // Only supports modern UI at the moment
  for (let account of accounts.accounts.filter((a) => a.link.url.startsWith('/'))) {
    console.log(`---> Fetching ${account.number}`)
    await netbank.exportAccount(account.link.url, account.number)
  }
  console.log('===> DONE')
  await netbank.stop()
}

main()
