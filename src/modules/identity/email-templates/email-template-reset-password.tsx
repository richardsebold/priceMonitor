import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Container,
  Tailwind,
  Text,
  Button,
  Section,
  Row,
  Column,
  Preview,
} from '@react-email/components';

interface EmailTemplateResetPasswordProps {
  userName: string;
  url: string;
}

const BRAND = '#4fa800';

export function EmailTemplateResetPassword({ userName, url }: EmailTemplateResetPasswordProps) {
  return (
    <Tailwind>
      <Html lang="pt-BR">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="x-apple-disable-message-reformatting" />
          <meta name="color-scheme" content="light" />
          <meta name="supported-color-schemes" content="light" />
        </Head>
        <Preview>Redefina sua senha na Price Tracker</Preview>

        <Body
          className="m-0 p-0 font-sans"
          style={{ backgroundColor: '#f4f4f5', margin: 0, padding: 0 }}
        >
          <Container
            className="mx-auto my-0 w-full"
            style={{ maxWidth: '600px', width: '100%', backgroundColor: BRAND }}
          >
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
              </Row>
            </Section>

            <Section
              style={{
                backgroundColor: '#ffffff',
                padding: '32px 28px 36px 28px',
                borderTopLeftRadius: '32px',
                borderTopRightRadius: '32px',
                borderBottomLeftRadius: '32px',
                borderBottomRightRadius: '32px',
              }}
            >
              <Text
                className="m-0"
                style={{
                  color: '#18181b',
                  fontSize: '22px',
                  fontWeight: 800,
                  lineHeight: '1.3',
                  letterSpacing: '-0.01em',
                  margin: '0 0 16px 0',
                }}
              >
                Olá, {userName}
              </Text>
              <Text
                className="m-0"
                style={{
                  color: '#3f3f46',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  margin: '0 0 24px 0',
                }}
              >
                Recebemos um pedido para redefinir a senha da sua conta na Price
                Tracker. Clique no botão abaixo para escolher uma nova senha.
                Este link expira em 1 hora.
              </Text>

              <Section style={{ textAlign: 'center', padding: '4px 0 8px 0' }}>
                <Button
                  href={url}
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
                  Redefinir senha
                </Button>
              </Section>

              <Text
                className="m-0"
                style={{
                  color: '#a1a1aa',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  margin: '24px 0 0 0',
                }}
              >
                Se você não pediu essa redefinição, ignore este e-mail — sua
                senha continua a mesma.
              </Text>
            </Section>

            <Section
              style={{
                backgroundColor: BRAND,
                padding: '20px 28px 28px 28px',
                textAlign: 'center',
              }}
            >
              <Text
                className="m-0"
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '11px',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                Você recebeu este e-mail porque pediu a redefinição de senha na
                Price Tracker.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
