import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'doc_screenshots')
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

async function capture() {
  console.log('Starting screenshot capture on http://localhost:3000...')
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 })

  const routes = [
    { name: '01_landing_page.png', url: 'http://localhost:3000' },
    { name: '02_equipment_marketplace.png', url: 'http://localhost:3000/equipment' },
    { name: '03_signup_page.png', url: 'http://localhost:3000/signup' },
    { name: '04_login_page.png', url: 'http://localhost:3000/login' },
  ]

  for (const r of routes) {
    try {
      console.log(`Navigating to ${r.url}...`)
      await page.goto(r.url, { waitUntil: 'load', timeout: 60000 })
      await new Promise(res => setTimeout(res, 2000))
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, r.name), fullPage: false })
      console.log(`✓ Captured ${r.name}`)
    } catch (e) {
      console.error(`Error capturing ${r.name}:`, e.message)
    }
  }

  // Also capture Owner signup tab with Aadhaar upload
  try {
    await page.goto('http://localhost:3000/signup', { waitUntil: 'load', timeout: 60000 })
    await new Promise(res => setTimeout(res, 1500))
    const buttons = await page.$$('button')
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b)
      if (text && text.includes('Owner')) {
        await b.click()
        break
      }
    }
    await new Promise(res => setTimeout(res, 1000))
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_owner_signup_aadhaar.png'), fullPage: false })
    console.log('✓ Captured 05_owner_signup_aadhaar.png')
  } catch (e) {
    console.error('Error on owner signup screenshot:', e.message)
  }

  // Mobile View
  try {
    const mobilePage = await browser.newPage()
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
    await mobilePage.goto('http://localhost:3000/equipment', { waitUntil: 'load', timeout: 60000 })
    await new Promise(res => setTimeout(res, 2000))
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '06_mobile_equipment_marketplace.png'), fullPage: false })
    console.log('✓ Captured 06_mobile_equipment_marketplace.png')
    await mobilePage.close()
  } catch (e) {
    console.error('Error on mobile marketplace screenshot:', e.message)
  }

  await browser.close()
  console.log('Done capturing screenshots!')
}

capture()
