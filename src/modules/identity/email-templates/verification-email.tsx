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
  Preview,
} from '@react-email/components';

interface VerificationEmailProps {
  userName: string;
  url: string;
}

const BRAND = '#4fa800';

export function VerificationEmail({ userName, url }: VerificationEmailProps) {
  return (
    <Tailwind>
      <Html lang="pt-BR">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="light" />
          <meta name="supported-color-schemes" content="light" />
        </Head>
        <Preview>Confirme seu e-mail para ativar sua conta</Preview>
        <Body
          className="m-0 p-0 font-sans"
          style={{ backgroundColor: '#f4f4f5', margin: 0, padding: 0 }}
        >
          <Container
            className="mx-auto my-0 w-full"
            style={{ maxWidth: '480px', width: '100%', padding: '32px 24px' }}
          >
            <Section
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center',
              }}
            >
              <Text
                className="m-0"
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#18181b',
                  margin: '0 0 12px 0',
                }}
              >
                Olá, {userName}!
              </Text>
              <Text
                className="m-0"
                style={{
                  fontSize: '15px',
                  color: '#52525b',
                  lineHeight: '1.5',
                  margin: '0 0 24px 0',
                }}
              >
                Confirme seu e-mail para ativar sua conta no Monitorador de Preços. O link
                expira em 1 hora.
              </Text>
              <Button
                href={url}
                style={{
                  backgroundColor: BRAND,
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 800,
                  padding: '12px 28px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Confirmar e-mail
              </Button>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
