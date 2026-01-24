const puppeteer = require('puppeteer')
const fs = require('fs')

const config = require('./config.json')
const url = config.url

if (!url) {
    console.error('URL not found in config.json')
    process.exit(1)
}

(async () => {
    const browser = await puppeteer.launch({ headless: 'false' })

    const page = await browser.newPage()
    
    await page.goto(url, { waitUntil: "load" })

    const nameSelectorTerabyte = 'h1.tit-prod'
    await page.waitForSelector(nameSelectorTerabyte)
    const nameTerabyte = await page.$eval(nameSelectorTerabyte, (el) => el.innerText.trim())

    const priceSelectorTerabyte = "#valVista"
    await page.waitForSelector(priceSelectorTerabyte)
    const priceTerabyte = await page.$eval(priceSelectorTerabyte, (el) => el.innerText.trim())

    const productDataTerabyte = {
        url,
        name: nameTerabyte,
        price: priceTerabyte,
        timestamp: new Date().toISOString()
    }

    fs.writeFileSync('product_price.json', JSON.stringify(productDataTerabyte, null, 2))
    console.log('Product data saved to product_price.json')

    await browser.close()

    
})()