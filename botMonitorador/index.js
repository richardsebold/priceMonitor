const puppeteer = require('puppeteer')
const fs = require('fs')

const config = require('./config.json')
const url = config.url

if (!url) {
    console.error('URL not found in config.json')
    process.exit(1)
}

(async () => {
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('Navegando para a URL...');
    await page.goto(url, { waitUntil: "networkidle2" })

    try {
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
        console.log('Concluido, dados salvos com sucesso em product_price.json')

    } catch (error) {
        console.error('Erro ao buscar dados:', error.message);
        await page.screenshot({ path: 'erro_debug.png' });
        console.log('Print do erro salvo em erro_debug.png');
    } finally {
        await browser.close()
    }
})()