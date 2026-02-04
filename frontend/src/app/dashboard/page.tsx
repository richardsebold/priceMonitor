import { headers } from "next/headers";
import { ButtonSignOut } from "@/components/button-signout";
import { auth } from "@/lib/auth";
import fs from "fs";
import { redirect } from "next/navigation";


interface Product {
  url: string;
  name: string;
  price: string | number; 
  image: string;
  method: string;
  currency: string;
  scrapedAt: string;
}

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  let products: Product[] = [];

  try {

    if (fs.existsSync('product_historico.json')) {
      const productData = fs.readFileSync('product_historico.json', 'utf-8');
      const parsedData = JSON.parse(productData);

      products = Array.isArray(parsedData) ? parsedData : [parsedData];
    }
  } catch (error) {
    console.error("Erro ao ler o arquivo JSON:", error);

  }

  const userImage = session.user.image;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      <div className="mx-auto flex justify-between items-center bg-white shadow px-8 py-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="text-sm text-gray-500">
            {session.user.name} • {session.user.email}
          </div>
        </div>
      
        <div className="flex items-center gap-4">
          {userImage ? (
            <img
              className="w-10 h-10 rounded-full border border-gray-200"
              src={userImage}
              alt={`Foto de ${session.user.name}`}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
              {session.user.name?.charAt(0)}
            </div>
          )}
          <ButtonSignOut />
        </div>
      </div>


      <div className="container mx-auto px-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Histórico de Monitoramento</h2>
        
        <div className="grid gap-4">
          {products.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded shadow">
              Nenhum dado encontrado. Execute o bot para popular o arquivo.
            </div>
          ) : (

            products.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-bold text-lg text-gray-800">{item.name || "Produto sem nome"}</p>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      className="text-blue-600 text-sm hover:underline block truncate max-w-xl"
                    >
                      {item.url}
                    </a>
                  </div>
                  <div className="text-right">
                     <p className="text-2xl font-bold text-green-600">{item.price || "---"}</p>
                     <p className="text-xs text-gray-400">{item.method}</p>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-400 border-t pt-2 flex gap-4">
                   <span>Moeda: {item.currency || "BRL"}</span>
                   <span>Extraído em: {item.scrapedAt ? new Date(item.scrapedAt).toLocaleString() : "-"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}