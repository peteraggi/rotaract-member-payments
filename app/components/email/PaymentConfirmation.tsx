// components/email/PaymentConfirmation.tsx
import { Html, Head, Font, Preview, Heading, Row, Section, Text, Button } from '@react-email/components';

interface PaymentConfirmationProps {
  fullName: string;
  amountPaid: number;
  balance: number;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
}

export default function PaymentConfirmation({
  fullName,
  amountPaid,
  balance,
  totalAmount,
  paymentMethod,
  transactionId,
}: PaymentConfirmationProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2'
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Your payment confirmation for REI Conference</Preview>
      <Section style={main}>
        <Row style={header}>
          <Heading style={heading}>Payment Confirmation</Heading>
        </Row>
        <Row style={body}>
          <Text style={paragraph}>Dear {fullName},</Text>
          <Text style={paragraph}>
            Thank you for your payment. Here are your payment details:
          </Text>
          
          <Section style={details}>
            <Row>
              <Text style={label}>Amount Paid:</Text>
              <Text style={value}>UGX {amountPaid.toLocaleString()}</Text>
            </Row>
            <Row>
              <Text style={label}>Total Amount:</Text>
              <Text style={value}>UGX {totalAmount.toLocaleString()}</Text>
            </Row>
            <Row>
              <Text style={label}>Balance:</Text>
              <Text style={value}>UGX {balance.toLocaleString()}</Text>
            </Row>
            <Row>
              <Text style={label}>Payment Method:</Text>
              <Text style={value}>{paymentMethod}</Text>
            </Row>
            <Row>
              <Text style={label}>Transaction ID:</Text>
              <Text style={value}>{transactionId}</Text>
            </Row>
          </Section>

          <Text style={paragraph}>
            If you have any questions, please contact our support team.
          </Text>
          
          <Button
            style={button}
            href="mailto:markkimbz@gmail.com"
          >
            Contact Support
          </Button>
        </Row>
        <Row style={footer}>
          <Text style={footerText}>
            REI Conference 2025 | All rights reserved
          </Text>
        </Row>
      </Section>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Roboto, Verdana, sans-serif',
  padding: '20px',
  maxWidth: '600px',
  margin: '0 auto',
  border: '1px solid #eeeeee',
  borderRadius: '5px'
};

const header = {
  borderBottom: '1px solid #dddddd',
  paddingBottom: '15px',
  marginBottom: '20px'
};

const heading = {
  color: '#333333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0'
};

const body = {
  padding: '10px 0'
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#333333',
  margin: '10px 0'
};

const details = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f9f9f9',
  borderRadius: '5px'
};

const label = {
  fontWeight: 'bold',
  width: '150px',
  display: 'inline-block',
  margin: '5px 0'
};

const value = {
  display: 'inline-block',
  margin: '5px 0'
};

const button = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  padding: '10px 20px',
  borderRadius: '5px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '15px 0'
};

const footer = {
  borderTop: '1px solid #dddddd',
  marginTop: '20px',
  paddingTop: '15px'
};

const footerText = {
  fontSize: '12px',
  color: '#777777',
  textAlign: 'center' as const
};