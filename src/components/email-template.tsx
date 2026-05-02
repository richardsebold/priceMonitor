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
  Preview,
  Link,
  Hr,
} from '@react-email/components';

interface EmailTemplateProps {
  product: ProductHistory;
  userName: string;
}

const BRAND = '#4fa800';
const BRAND_DARK = '#3d8500';
const BRAND_LIGHT = '#b6f24a';
const BRAND_DEEP = '#2c5f00';

const WAVE_DOWN_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 40' preserveAspectRatio='none'><path d='M0,0 C150,40 300,0 450,20 C525,30 600,10 600,0 L600,40 L0,40 Z' fill='%23ffffff'/></svg>`;
const WAVE_UP_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 40' preserveAspectRatio='none'><path d='M0,40 C150,0 300,40 450,20 C525,10 600,30 600,40 L600,0 L0,0 Z' fill='%234fa800'/></svg>`;

export function EmailTemplate({ product, userName }: EmailTemplateProps) {
  const dataFormatada =
    product.scrapedAt instanceof Date
      ? product.scrapedAt.toLocaleDateString('pt-BR')
      : String(product.scrapedAt);

  const currencyPrefix = product.currency === 'BRL' ? 'R$ ' : '';
  const priceNumber = Number(product.price);
  const targetNumber = Number(product.priceTarget);
  const discountPct =
    targetNumber > 0 && priceNumber < targetNumber
      ? Math.max(1, Math.round(((targetNumber - priceNumber) / targetNumber) * 100))
      : null;

  return (
    <Tailwind>
      <Html lang="pt-BR">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="x-apple-disable-message-reformatting" />
          <meta name="color-scheme" content="light" />
          <meta name="supported-color-schemes" content="light" />
        </Head>
        <Preview>
          {`Preço caiu! ${product.name} agora por ${currencyPrefix}${product.price}`}
        </Preview>

        <Body
          className="m-0 p-0 font-sans"
          style={{ backgroundColor: '#f4f4f5', margin: 0, padding: 0 }}
        >
          <Container
            className="mx-auto my-0 w-full"
            style={{ maxWidth: '600px', width: '100%' }}
          >
            {/* ============= HEADER (verde) ============= */}
            <Section
              style={{
                backgroundColor: BRAND,
                padding: '24px 28px 12px 28px',
              }}
            >
              <Row>
                <Column align="left">
                  <Text
                    className="m-0"
                    style={{
                      color: '#ffffff',
                      fontSize: '20px',
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      margin: 0,
                    }}
                  >
                    Price Tracker
                  </Text>
                </Column>
                <Column align="right">
                  <Link
                    href="#"
                    style={{
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '12px',
                      textDecoration: 'underline',
                    }}
                  >
                    Cancelar inscrição
                  </Link>
                </Column>
              </Row>
            </Section>

            {/* ============= HERO ============= */}
            <Section
              style={{
                backgroundColor: BRAND,
                padding: '20px 28px 36px 28px',
                textAlign: 'center',
              }}
            >
              {discountPct !== null && (
                <Text
                  className="m-0"
                  style={{
                    display: 'inline-block',
                    backgroundColor: BRAND_LIGHT,
                    color: BRAND_DEEP,
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    margin: '0 0 18px 0',
                  }}
                >
                  {`${discountPct}% abaixo da sua meta`}
                </Text>
              )}
              <Text
                className="m-0"
                style={{
                  color: '#ffffff',
                  fontSize: '36px',
                  lineHeight: '1.05',
                  fontWeight: 900,
                  letterSpacing: '-0.025em',
                  margin: '0 0 12px 0',
                }}
              >
                Bingo, {userName}!
                <br />O preço caiu.
              </Text>
              <Text
                className="m-0"
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '15px',
                  lineHeight: '1.5',
                  margin: 0,
                }}
              >
                O produto que você estava monitorando atingiu (ou ficou abaixo
                da) sua meta. Hora certa de fechar.
              </Text>
            </Section>

            {/* ============= WAVE: verde -> branco ============= */}
            <Section style={{ backgroundColor: BRAND, lineHeight: 0, fontSize: 0 }}>
              <Img
                src={WAVE_DOWN_SVG}
                alt=""
                width="600"
                height="40"
                style={{
                  display: 'block',
                  width: '100%',
                  height: '40px',
                  border: 0,
                  outline: 'none',
                }}
              />
            </Section>

            {/* ============= PRODUTO (branco) ============= */}
            <Section style={{ backgroundColor: '#ffffff', padding: '8px 28px 28px 28px' }}>
              {product.image && (
                <Section
                  style={{
                    backgroundColor: '#fafafa',
                    borderRadius: '16px',
                    padding: '20px',
                    textAlign: 'center',
                  }}
                >
                  <Img
                    src={product.image as string}
                    alt={(product.name as string) || 'Produto'}
                    style={{
                      display: 'block',
                      maxWidth: '100%',
                      width: 'auto',
                      maxHeight: '240px',
                      margin: '0 auto',
                      borderRadius: '8px',
                    }}
                  />
                </Section>
              )}

              <Text
                className="m-0"
                style={{
                  color: '#18181b',
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: '1.3',
                  letterSpacing: '-0.01em',
                  textAlign: 'center',
                  margin: '24px 0 18px 0',
                }}
              >
                {product.name}
              </Text>

              {/* Card preços */}
              <Section
                style={{
                  border: `1px solid #e4e4e7`,
                  borderRadius: '14px',
                  padding: '16px',
                  backgroundColor: '#ffffff',
                }}
              >
                <Row>
                  <Column align="center" style={{ width: '50%', padding: '4px 8px' }}>
                    <Text
                      className="m-0"
                      style={{
                        color: '#a1a1aa',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        margin: '0 0 6px 0',
                      }}
                    >
                      Sua meta
                    </Text>
                    <Text
                      className="m-0"
                      style={{
                        color: '#71717a',
                        fontSize: '17px',
                        fontWeight: 600,
                        textDecoration: 'line-through',
                        margin: 0,
                      }}
                    >
                      {currencyPrefix}
                      {product.priceTarget}
                    </Text>
                  </Column>
                  <Column align="center" style={{ width: '50%', padding: '4px 8px' }}>
                    <Text
                      className="m-0"
                      style={{
                        color: BRAND_DARK,
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        margin: '0 0 6px 0',
                      }}
                    >
                      Preço atual
                    </Text>
                    <Text
                      className="m-0"
                      style={{
                        color: BRAND_DARK,
                        fontSize: '26px',
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                        margin: 0,
                      }}
                    >
                      {currencyPrefix}
                      {product.price}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* CTA primário */}
              <Section style={{ textAlign: 'center', padding: '24px 0 4px 0' }}>
                <Button
                  href={product.url}
                  style={{
                    backgroundColor: BRAND,
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    padding: '14px 36px',
                    borderRadius: '999px',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Comprar agora
                </Button>
              </Section>
            </Section>

            {/* ============= WAVE: branco -> verde ============= */}
            <Section style={{ backgroundColor: '#ffffff', lineHeight: 0, fontSize: 0 }}>
              <Img
                src={WAVE_UP_SVG}
                alt=""
                width="600"
                height="40"
                style={{
                  display: 'block',
                  width: '100%',
                  height: '40px',
                  border: 0,
                  outline: 'none',
                }}
              />
            </Section>

            {/* ============= FOOTER (verde) ============= */}
            <Section
              style={{
                backgroundColor: BRAND,
                padding: '28px 28px 36px 28px',
                textAlign: 'center',
              }}
            >
              <Text
                className="m-0"
                style={{
                  color: '#ffffff',
                  fontSize: '22px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: '1.3',
                  margin: '0 0 8px 0',
                }}
              >
                Não perca o timing.
              </Text>
              <Text
                className="m-0"
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  margin: '0 0 22px 0',
                }}
              >
                Preço de e-commerce sobe e desce em horas. Vai lá antes que mude.
              </Text>
              <Button
                href={product.url}
                style={{
                  backgroundColor: '#ffffff',
                  color: BRAND_DARK,
                  fontSize: '15px',
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                  padding: '12px 32px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Abrir produto
              </Button>

              <Hr
                style={{
                  borderColor: 'rgba(255,255,255,0.18)',
                  borderTopWidth: '1px',
                  borderTopStyle: 'solid',
                  margin: '28px 0 16px 0',
                }}
              />
              <Text
                className="m-0"
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '11px',
                  lineHeight: '1.6',
                  margin: '0 0 6px 0',
                }}
              >
                Última verificação: {dataFormatada} • Método: {product.method}
              </Text>
              <Text
                className="m-0"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '11px',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                Você recebeu este alerta porque configurou um monitoramento na
                Price Tracker.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
