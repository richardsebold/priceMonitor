const options = {
  method: 'POST',
  headers: {Authorization: 'Bearer <token>', 'Content-Type': 'application/json'},
  body: JSON.stringify({
    frequency: 'ONE_TIME',
    methods: ['PIX', 'CARD'],
    products: [
      {
        externalId: 'prod-1234',
        name: 'Assinatura de Programa Fitness',
        description: 'Acesso ao programa fitness premium por 1 mês.',
        quantity: 2,
        price: 2000
      }
    ],
    returnUrl: 'https://example.com/billing',
    completionUrl: 'https://example.com/completion',
    customerId: 'cust_abcdefghij',
    customer: {
      name: 'Daniel Lima',
      cellphone: '(11) 4002-8922',
      email: 'daniel_lima@abacatepay.com',
      taxId: '123.456.789-01'
    },
    allowCoupons: false,
    coupons: ['ABKT10', 'ABKT5', 'PROMO10'],
    externalId: 'seu_id_123',
    metadata: {externalId: '123'}
  })
};

fetch('https://api.abacatepay.com/v1/billing/create', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));


  // Substitua <token> pela sua chave de API real da AbacatePay
const TOKEN = '<token>'; 

const payload = {
  frequency: "ONE_TIME",
  methods: ["PIX", "CARD"],
  products: [
    {
      externalId: "prod-1234",
      name: "Assinatura de Programa Fitness",
      description: "Acesso ao programa fitness premium por 1 mês.",
      quantity: 2,
      price: 2000
    }
  ],
  returnUrl: "https://example.com/billing",
  completionUrl: "https://example.com/completion",
  customerId: "cust_abcdefghij",
  customer: {
    name: "Daniel Lima",
    cellphone: "(11) 4002-8922",
    email: "daniel_lima@abacatepay.com",
    taxId: "123.456.789-01"
  },
  allowCoupons: false,
  coupons: ["ABKT10", "ABKT5", "PROMO10"],
  externalId: "seu_id_123",
  metadata: {
    externalId: "123"
  }
};

async function createBilling() {
  try {
    const response = await fetch('https://api.abacatepay.com/v1/billing/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro na API da AbacatePay:", data);
      return;
    }

    console.log("Cobrança criada com sucesso!", data);
    return data;

  } catch (error) {
    console.error("Erro de rede ou de execução:", error);
  }
}

createBilling();