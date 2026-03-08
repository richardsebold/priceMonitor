import * as React from 'react';
import { ProductHistory } from '../../generated/prisma/client';
import {
  Html,
  Body,
  Head,
  Container,
  Tailwind,
  Text,
  Button,
  Img,
  Section,
  Row,
  Column,
} from '@react-email/components';

// const logoImage = 'https://www.pngarts.com/pt/explore/63863/download/63862.png';

interface EmailTemplateProps {
  product: ProductHistory;
  userName: string;
}

export function EmailTemplate({ product, userName }: EmailTemplateProps) {

  const dataFormatada =
    product.scrapedAt instanceof Date
      ? product.scrapedAt.toLocaleDateString('pt-BR')
      : String(product.scrapedAt);

  return (
    <Tailwind>
      <Html>
        <Head />

        <Body className="bg-zinc-100 font-sans m-0">

          <Container className="max-w-150 mx-auto bg-white rounded-xl overflow-hidden shadow-sm border border-zinc-200">
            

            <Section className="bg-green-500 p-6 text-center">
              {/* <Img
                src={logoImage}
                alt="Price Tracker Logo"
                width="40"
                height="40"
                className="rounded-lg mx-auto"
              /> */}
              <Text className="text-black m-0 text-2xl font-semibold mt-3">
                Alerta de Preço Baixo!
              </Text>
            </Section>


            <Section className="p-8">
              <Text className="text-zinc-900 text-xl m-0 mb-4 font-semibold">
                Olá, {userName}!
              </Text>
              <Text className="text-zinc-600 text-base leading-relaxed m-0 mb-6">
                Ótima notícia! O produto que você estava monitorando acabou de
                atingir ou ficar abaixo da sua meta.
              </Text>


              <Section className="bg-zinc-50 border border-zinc-200 rounded-lg p-5 text-center mb-6">
                {product.image && (
                  <Img
                    src={product.image as string}
                    alt={product.name as string}
                    className="max-w-full max-h-50 object-contain mx-auto mb-4 rounded"
                  />
                )}
                <Text className="text-zinc-800 text-lg m-0 mb-5 font-medium">
                  {product.name}
                </Text>


                <Row className="bg-white p-4 rounded-md border border-zinc-200 w-full">
                  <Column className="text-center w-1/2">
                    <Text className="text-xs text-zinc-500 uppercase font-semibold m-0 mb-1">
                      Sua Meta:
                    </Text>
                    <Text className="text-lg text-zinc-500 line-through m-0">
                      {product.currency === 'BRL' ? 'R$ ' : ''}
                      {product.priceTarget}
                    </Text>
                  </Column>
                  <Column className="text-center w-1/2">
                    <Text className="text-xs text-zinc-500 uppercase font-semibold m-0 mb-1">
                      Preço Atual:
                    </Text>
                    <Text className="text-2xl text-green-600 font-bold m-0">
                      {product.currency === 'BRL' ? 'R$ ' : ''}
                      {product.price}
                    </Text>
                  </Column>
                </Row>
              </Section>


              <Button
                href={product.url}
                className="block w-full text-center bg-blue-600 text-white py-4 rounded-lg text-lg font-bold mb-8 no-underline"
              >
                Comprar Agora
              </Button>


              <Section className="border-t border-zinc-200 pt-6 text-center">
                <Text className="text-zinc-400 text-xs m-0 mb-2">
                  Última verificação: {dataFormatada} • Método de busca: {product.method}
                </Text>
                <Text className="text-zinc-400 text-xs m-0">
                  Você está recebendo este e-mail porque configurou um alerta na
                  nossa plataforma.
                </Text>
              </Section>

            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}