import * as React from 'react';
import type { WeeklyProductChange } from '@/modules/analytics/domain/weekly-variation';
import {
  Html,
  Body,
  Head,
  Container,
  Tailwind,
  Text,
  Section,
  Row,
  Column,
  Preview,
  Hr,
} from '@react-email/components';

interface EmailTemplateWeeklySummaryProps {
  userName: string;
  changes: WeeklyProductChange[];
  biggestDrop: WeeklyProductChange | null;
  potentialSavings: number;
}

const BRAND = '#4fa800';
const BRAND_DARK = '#3d8500';

function formatPrice(price: number) {
  return `R$ ${price.toFixed(2)}`;
}

export function EmailTemplateWeeklySummary({
  userName,
  changes,
  biggestDrop,
  potentialSavings,
}: EmailTemplateWeeklySummaryProps) {
  return (
    <Tailwind>
      <Html lang="pt-BR">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="light" />
          <meta name="supported-color-schemes" content="light" />
        </Head>
        <Preview>{`Seu resumo semanal: ${changes.length} produto(s) monitorado(s)`}</Preview>

        <Body
          className="m-0 p-0 font-sans"
          style={{ backgroundColor: '#f4f4f5', margin: 0, padding: 0 }}
        >
          <Container
            className="mx-auto my-0 w-full"
            style={{ maxWidth: '600px', width: '100%', backgroundColor: '#ffffff' }}
          >
            <Section style={{ backgroundColor: BRAND, padding: '24px 28px' }}>
              <Text
                className="m-0"
                style={{ color: '#ffffff', fontSize: '20px', fontWeight: 800, margin: 0 }}
              >
                Seu Resumo Semanal
              </Text>
            </Section>

            <Section style={{ padding: '28px' }}>
              <Text style={{ fontSize: '16px', margin: '0 0 16px 0' }}>Olá, {userName}!</Text>

              {biggestDrop && (
                <Section
                  style={{
                    backgroundColor: '#f0fdf4',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <Text style={{ fontSize: '13px', fontWeight: 700, color: BRAND_DARK, margin: '0 0 4px 0' }}>
                    Maior queda da semana
                  </Text>
                  <Text style={{ fontSize: '15px', margin: 0 }}>
                    {biggestDrop.name}: de {formatPrice(biggestDrop.priceWeekAgo)} para{' '}
                    {formatPrice(biggestDrop.priceNow)} ({biggestDrop.changePct.toFixed(1)}% de queda)
                  </Text>
                </Section>
              )}

              <Text style={{ fontSize: '13px', fontWeight: 700, color: '#71717a', margin: '0 0 8px 0' }}>
                Seus produtos
              </Text>
              {changes.map((change, i) => (
                <Row key={i} style={{ padding: '8px 0', borderTop: i > 0 ? '1px solid #e4e4e7' : undefined }}>
                  <Column>
                    <Text style={{ fontSize: '14px', margin: 0 }}>{change.name}</Text>
                  </Column>
                  <Column align="right">
                    <Text style={{ fontSize: '14px', margin: 0 }}>
                      {formatPrice(change.priceWeekAgo)} → {formatPrice(change.priceNow)}
                    </Text>
                  </Column>
                </Row>
              ))}

              <Hr style={{ margin: '20px 0' }} />

              <Text style={{ fontSize: '14px', margin: 0 }}>
                Economia potencial total: <strong>{formatPrice(potentialSavings)}</strong>
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
