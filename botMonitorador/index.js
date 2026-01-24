const puppeteer = require('puppeteer');
const fs = require('fs');

// --- CONFIGURAÇÃO: APENAS O NOME DO PRODUTO ---
const NOME_PRODUTO = "RTX 4060 Gigabyte"; 
// ----------------------------------------------

(async () => {
    const browser = await puppeteer.launch({ 
        headless: false, // Deixe false para ver ele trabalhando (ou 'new'/'true' para produção)
        defaultViewport: null,
        args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // 1. Configuração Anti-Bloqueio
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        console.log(`🤖 Iniciando busca inteligente por: "${NOME_PRODUTO}"...`);

        // 2. BUSCA INTELIGENTE NO GOOGLE
        // Usamos o operador "site:" para forçar o Google a retornar apenas links da Terabyte
        await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });

        // Digita na barra de busca (o seletor do textarea do Google é 'textarea[name="q"]')
        await page.waitForSelector('textarea[name="q"]');
        await page.type('textarea[name="q"]', `site:terabyteshop.com.br ${NOME_PRODUTO}`);
        await page.keyboard.press('Enter');

        // 3. SELECIONA O PRIMEIRO LINK REAL
        // Espera os resultados carregarem (div.g é o bloco de resultado padrão do Google)
        await page.waitForSelector('div.g a h3', { timeout: 10000 });
        
        console.log('Google encontrou resultados. Clicando no primeiro...');
        
        // Clica no primeiro título encontrado (h3 dentro de um link)
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }), // Espera o site carregar
            page.click('div.g a h3') 
        ]);

        // Verifica se realmente entramos na Terabyte (se tem o logo ou titulo)
        if (!page.url().includes('terabyteshop.com.br')) {
            throw new Error(`O Google redirecionou para um site errado: ${page.url()}`);
        }

        console.log(`🔗 URL Encontrada: ${page.url()}`);

        // 4. EXTRAÇÃO DE DADOS (SEU CÓDIGO ORIGINAL)
        const nameSelectorTerabyte = 'h1.tit-prod';
        await page.waitForSelector(nameSelectorTerabyte, { timeout: 15000 });
        const nameTerabyte = await page.$eval(nameSelectorTerabyte, (el) => el.innerText.trim());

        const priceSelectorTerabyte = "#valVista";
        // As vezes o preço demora um pouco mais pra aparecer via JS
        await page.waitForSelector(priceSelectorTerabyte, { timeout: 15000 });
        const priceTerabyte = await page.$eval(priceSelectorTerabyte, (el) => el.innerText.trim());

        const productDataTerabyte = {
            search_term: NOME_PRODUTO,
            found_url: page.url(),
            name: nameTerabyte,
            price: priceTerabyte,
            timestamp: new Date().toISOString()
        };

        fs.writeFileSync('product_price.json', JSON.stringify(productDataTerabyte, null, 2));
        console.log('✅ Sucesso! Dados salvos em product_price.json');

    } catch (error) {
        console.error('❌ Ocorreu um erro:', error.message);
        await page.screenshot({ path: 'erro_debug.png' });
        console.log('Print do erro salvo em erro_debug.png');
    } finally {
        await browser.close();
    }
})();