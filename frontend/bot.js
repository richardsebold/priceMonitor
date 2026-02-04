import puppeteer from 'puppeteer';
import fs from 'fs';
import { createRequire } from 'module';


const require = createRequire(import.meta.url);
const config = require('./config.json');

const url = config.url;
const DB_FILE = 'produtos_historico.json'; 

if (!url) {
    console.error('❌ URL não encontrada no config.json');
    process.exit(1);
}

(async () => {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log(`🔎 Navegando para: ${url}`);
    
    try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });


        const productData = await page.evaluate(() => {
            let data = { name: null, price: null, method: null };

            const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
            for (const script of jsonLdScripts) {
                try {
                    const json = JSON.parse(script.innerText);
                    const nodes = Array.isArray(json) ? json : [json];
                    const product = nodes.find(n => n['@type'] === 'Product');
                    if (product) {
                        data.name = product.name;
                        const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
                        if (offer) data.price = offer.price || offer.lowPrice;
                        data.method = 'json-ld';
                        return data;
                    }
                } catch(e){}
            }


            const ogTitle = document.querySelector('meta[property="og:title"]');
            const ogPrice = document.querySelector('meta[property="product:price:amount"]');
            
            if (ogTitle) {
                data.name = ogTitle.content;
                data.price = ogPrice ? ogPrice.content : null;
                data.method = 'meta-tags';
                return data;
            }


            const h1 = document.querySelector('h1');
            data.name = h1 ? h1.innerText.trim() : document.title;
            const bodyText = document.body.innerText;
            const priceMatch = bodyText.match(/(?:R\$|\$)\s?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/);
            if (priceMatch) data.price = priceMatch[0];
            data.method = 'visual';
            
            return data;
        });

        const finalData = {
            id: Date.now(),
            url,
            ...productData,
            scrapedAt: new Date().toISOString()
        };

 
        let database = [];


        if (fs.existsSync(DB_FILE)) {
            const rawData = fs.readFileSync(DB_FILE, 'utf-8');
            try {
                const parsedData = JSON.parse(rawData);
                database = Array.isArray(parsedData) ? parsedData : [parsedData];
            } catch (e) {
                console.log('⚠️ Arquivo existente estava corrompido ou vazio, criando novo.');
                database = [];
            }
        }


        database.push(finalData);


        fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
        
        console.log('✅ Sucesso! Novo item adicionado ao histórico.');
        console.log(`📂 Total de itens salvos: ${database.length}`);

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await browser.close();
    }
})();