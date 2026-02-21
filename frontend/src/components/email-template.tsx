import * as React from 'react';
import { ProductHistory} from '../../generated/prisma/client';


export function EmailTemplate({ product}: { product: ProductHistory}) {
  return (
    <div>
      <h1>Olá, Richard! </h1>
      <p>O produto {product.name} está abaixo do preço desejado.</p>
      <p>Preço atual: R$ {product.price}</p>
      <p>Moeda: {product.currency}</p>
      <p>Meta de preço: R$ {product.priceTarget}</p>
      <p>Rastrado em: {product.scrapedAt instanceof Date ? product.scrapedAt.toLocaleDateString('pt-BR') : String(product.scrapedAt)}</p>
      <p>Metodo: {product.method}</p>
      <a href={product.url} target="_blank" rel="noopener noreferrer">Ver produto</a>
      <img src={product.image as string} alt={product.name as string} width={200} height={200} />

    </div>
  );
}