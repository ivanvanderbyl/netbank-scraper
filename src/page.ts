require('dotenv').config()
import fs from 'fs/promises'
import KSUID from 'ksuid'
import pptr, {
  Browser,
  BrowserConnectOptions,
  BrowserLaunchArgumentOptions,
  ClickOptions,
  LaunchOptions,
  Page,
} from 'puppeteer'

export const LOGIN_URL = 'https://www.my.commbank.com.au/netbank/Logon/Logon.aspx'

export const PageSelectors = {
  usernameLabel: '#txtMyClientNumber_label',
  usernameInput: '#txtMyClientNumber_field',
  passwordLabel: '#txtMyPassword_label',
  passwordInput: '#txtMyPassword_field',
  loginButton: '#btnLogon_field',
  accountsMain: 'main[role="main"]',
  accountsList: 'section.account-list-wrapper .account-row',
  accountItem: '.account-wrapper',
  accountItemLink: '.account-wrapper .account-info a.account-link',
  accountItemNumber: '.account-wrapper .account-info .account-number',
}

const userAgent = `User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36`

interface Options {
  screenshotPath: string
  userDataDir: string
}

export interface Accounts {
  accounts: Account[]
}

export interface Account {
  number: string
  id: string
  displayName: string
  balance: AvailableFund[]
  availableFunds: AvailableFund[]
  link: Link
  isNumberMasked: boolean
  isHidden: boolean
  isStopped: boolean
  productCode: string
  productSubCode: string
  actionsAllowed: ActionsAllowed[]
  optionLinks: OptionLink[]
  group?: string
  notification: Notification
  awardsLinkParameter?: string
}

export enum ActionsAllowed {
  TransferFrom = 'TransferFrom',
  TransferTo = 'TransferTo',
}

export interface AvailableFund {
  amount: number
  currency: Currency
}

export enum Currency {
  Aud = 'AUD',
}

export interface Link {
  url: string
}

export interface Notification {}

export interface OptionLink {
  displayText: string
  url: string
}

export class AutomatedPage {
  private browser?: Browser
  private page?: Page

  constructor(
    private options: Options = {
      screenshotPath: './screenshots',
      userDataDir: './userData',
    },
  ) {}

  async start(options: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions = {}) {
    await this.prepare()
    // options.userDataDir = this.options.userDataDir
    this.browser = await pptr.launch(options)
    return this
  }

  async stop() {
    await this.browser?.close?.()
    return this
  }

  async login(username: string, password: string) {
    if (!this.browser) {
      throw new Error('Browser not started')
    }

    const page = await this.browser.newPage()
    await page.setUserAgent(userAgent)
    // await page.setRequestInterception(true)
    this.page = page

    await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' })

    await page.waitForSelector(PageSelectors.usernameInput, { visible: true })
    await page.focus(PageSelectors.usernameInput)
    await page.keyboard.type(username)
    await page.focus(PageSelectors.passwordInput)
    await page.keyboard.type(password)
    await this.click(PageSelectors.loginButton)

    await page.waitForNavigation({ waitUntil: 'networkidle2' })
    return this
  }

  async click(selector: string, options?: ClickOptions) {
    const element = await this.page!.waitForSelector(selector, { visible: true })
    if (element == null) return
    await element.click(options)
    return this
  }

  async fetch(url: string) {
    const page = this.page!
    let result = await page.evaluate(
      async (url: string) => fetch(url).then((resp) => resp.text()),
      url,
    )
    return JSON.parse(result)
  }

  async collectAccounts(): Promise<Accounts> {
    const page = this.page!
    let accounts = new Promise<Accounts>((yeah, nah) => {
      async function handler(resp: pptr.PageEventObject['response']) {
        if (resp.url().includes('retail/netbank/api/home/v1/accounts')) {
          let data = await resp.json()
          page.off('response', handler)
          yeah(data)
        }
        return resp
      }
      setTimeout(() => nah(), 30_000)
      this.page?.on('response', handler)
    })
    return accounts
  }

  async screenshot(name?: string) {
    if (!this.page) return
    name = KSUID.randomSync().toString() + (name ? `-${name}` : '')
    let path = `${this.options.screenshotPath}/${name}.png`
    await this.page.screenshot({ path })
    return this
  }

  private async prepare() {
    await fs.mkdir(this.options.screenshotPath, { recursive: true })
  }

  private async clickOnElement(selector: string, x = null, y = null) {
    const rect = await this.page?.$eval(selector, (el) => {
      const { top, left, width, height } = el.getBoundingClientRect()
      return { top, left, width, height }
    })
    console.log(rect)

    if (!rect) return
    const _x = x !== null ? x : rect.width / 2
    const _y = y !== null ? y : rect.height / 2
    await this.page?.mouse.click(rect.left + _x, rect.top + _y)
  }
}
