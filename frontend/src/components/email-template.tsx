import * as React from 'react';
import { ProductHistory, User } from '../../generated/prisma/client';



export function EmailTemplate({ product, user }: { product: ProductHistory, user: User }) {
  return (
    <div>
      <h1>Olá, {user.name}! </h1>
      <p>O produto {product.name} está abaixo do preço desejado.</p>
    </div>
  );
}