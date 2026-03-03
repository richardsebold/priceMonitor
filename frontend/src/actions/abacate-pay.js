import AbacatePay from 'abacatepay-nodejs-sdk';

// ==================== CONFIGURAÇÃO ====================
// Pegue sua chave em https://www.abacatepay.com/ (dashboard → API Keys)
// Use a chave de sandbox/dev para testes
const API_KEY = 'sk_sua_chave_aqui'; // ← SUBSTITUA

const abacate = AbacatePay(API_KEY);

// ==================== CRIAR COBRANÇA (PIX + CARTÃO) ====================
async function criarCobranca() {
  try {
    const cobranca = await abacate.billing.create({
      frequency: "ONE_TIME",           // ou "MONTHLY" para assinatura
      methods: ["PIX", "CARD"],        // pode ser só ["PIX"]
      products: [
        {
          externalId: "PROD-001",
          name: "Plano Pro Mensal",
          quantity: 1,
          price: 2990                  // 29,90 em centavos
        }
      ],
      returnUrl: "https://seusite.com/app",           // onde o cliente volta depois de pagar
      completionUrl: "https://seusite.com/sucesso",   // página de sucesso
      customer: {
        email: "cliente@email.com",
        // name: "João Silva",          // opcional
        // phone: "+5511999999999"      // opcional
      }
    });

    console.log("✅ Cobrança criada com sucesso!");
    console.log("ID:", cobranca.data.id);
    console.log("Link de pagamento:", cobranca.data.url);
    console.log("Status:", cobranca.data.status);

    return cobranca.data;
  } catch (error) {
    console.error("❌ Erro ao criar cobrança:", error);
    throw error;
  }
}

// ==================== BUSCAR COBRANÇA ====================
async function buscarCobranca(billingId) {
  try {
    const resultado = await abacate.billing.get(billingId);
    console.log("📄 Cobrança encontrada:", resultado.data);
    return resultado.data;
  } catch (error) {
    console.error("Erro ao buscar:", error);
  }
}

// ==================== EXECUTAR ====================
async function main() {
  const novaCobranca = await criarCobranca();
  // await buscarCobranca(novaCobranca.id);
}

main();