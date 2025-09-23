// emails/PaymentReminder.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface PaymentReminderProps {
  fullName?: string;
  amountPaid?: number;
  balanceDue?: number;
}

const PaymentReminder = ({ fullName, amountPaid = 0, balanceDue = 0 }: PaymentReminderProps) => {
  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Payment Reminder - REI Conference</title>
        <style>
          {`
            /* Reset styles for email clients */
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
            }
            
            /* Mobile First Styles */
            @media only screen and (max-width: 620px) {
              body {
                padding: 10px !important;
                background-color: #fff !important;
              }
              
              .container {
                width: 100% !important;
                border-radius: 0 !important;
                max-width: 100% !important;
              }
              
              .header {
                padding: 25px 15px !important;
                border-radius: 0 !important;
              }
              
              .logo {
                width: 100px !important;
                height: auto !important;
              }
              
              h1 {
                font-size: 22px !important;
                margin: 25px 15px 15px !important;
                line-height: 1.2 !important;
              }
              
              .paragraph {
                font-size: 16px !important;
                margin: 15px 15px !important;
                line-height: 1.5 !important;
              }
              
              .payment-section {
                margin: 10px !important;
                padding: 15px !important;
              }
              
              .section-title {
                font-size: 16px !important;
                margin-bottom: 12px !important;
              }
              
              .payment-grid {
                grid-template-columns: 1fr !important;
                gap: 10px !important;
              }
              
              .payment-item {
                padding: 15px !important;
                min-height: auto !important;
                height: auto !important;
              }
              
              .payment-value {
                font-size: 16px !important;
              }
              
              .button-container {
                margin: 20px 15px !important;
              }
              
              .button {
                font-size: 16px !important;
                padding: 16px 20px !important;
                width: auto !important;
                display: inline-block !important;
                max-width: 100% !important;
              }
              
              .contact-section {
                margin: 15px !important;
                padding: 15px !important;
              }
              
              .footer {
                padding: 15px !important;
                margin-top: 20px !important;
                border-radius: 0 !important;
              }
              
              .footer-text {
                font-size: 11px !important;
                line-height: 1.3 !important;
              }
            }
            
            /* Small phones */
            @media only screen and (max-width: 400px) {
              body {
                padding: 5px !important;
              }
              
              .header {
                padding: 20px 10px !important;
              }
              
              h1 {
                font-size: 20px !important;
                margin: 20px 10px 12px !important;
              }
              
              .paragraph {
                font-size: 15px !important;
                margin: 12px 10px !important;
                line-height: 1.4 !important;
              }
              
              .payment-section {
                margin: 10px !important;
                padding: 12px !important;
              }
              
              .payment-item {
                padding: 12px !important;
                min-height: auto !important;
              }
              
              .button {
                padding: 14px 16px !important;
                font-size: 15px !important;
              }
            }
            
            /* Very small phones */
            @media only screen and (max-width: 350px) {
              .logo {
                width: 80px !important;
              }
              
              h1 {
                font-size: 18px !important;
              }
              
              .paragraph {
                font-size: 14px !important;
              }
              
              .payment-value {
                font-size: 15px !important;
              }
            }
            
            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
              .dark-mode-bg {
                background-color: #666666 !important;
              }
              
              .dark-mode-text {
                color: #ffffff !important;
              }
              
              .dark-mode-card {
                background-color: #2d2d2d !important;
              }
              
              .dark-mode-payment {
                background-color: #3d3d3d !important;
                border-color: #4d4d4d !important;
              }
              
              .dark-mode-contact {
                background-color: #2a4d6d !important;
                border-color: #3a5d7d !important;
              }
            }
            
            /* Force gray background for all clients */
            body, .dark-mode-bg {
              background-color: #666666 !important;
            }
          `}
        </style>
      </Head>
      <Preview>Reminder: Complete Your REI Conference Payment</Preview>
      <Body style={main} className="dark-mode-bg">
        <Container style={container} className="dark-mode-card">
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src="https://firebasestorage.googleapis.com/v0/b/beacon-hostels.appspot.com/o/images%2Flogo.png?alt=media&token=0981f32b-11b0-4d89-9df3-2b163a4a4d63"
              width="120"
              height="auto"
              alt="REI Conference Logo"
              style={logo}
            />
          </Section>

          <Heading style={h1} className="dark-mode-text">Payment Reminder</Heading>
          
          <Text style={paragraph} className="dark-mode-text">
            Dear {fullName},
          </Text>
          
          <Text style={paragraph} className="dark-mode-text">
            This is a friendly reminder that your payment for the REI Conference is incomplete. 
            Please complete your payment to secure your participation in the event.
          </Text>

          {/* Payment Summary */}
          <Section style={paymentSection} className="payment-section dark-mode-payment">
            <Text style={sectionTitle} className="dark-mode-text">Payment Summary</Text>
            
            <div style={paymentGrid} className="payment-grid">
              <div style={paymentItem} className="dark-mode-payment">
                <Text style={paymentLabel} className="dark-mode-text">Amount Paid</Text>
                <Text style={paymentValue} className="dark-mode-text">UGX {amountPaid.toLocaleString()}</Text>
              </div>
              
              <div style={paymentItem} className="dark-mode-payment">
                <Text style={{...paymentLabel, color: '#ff6b6b'}} className="dark-mode-text">Balance Due</Text>
                <Text style={{...paymentValue, color: '#ff6b6b'}} className="dark-mode-text">UGX {balanceDue.toLocaleString()}</Text>
              </div>
            </div>
          </Section>

          <Text style={paragraph} className="dark-mode-text">
            We kindly request you to complete the payment at your earliest convenience to ensure your spot is reserved.
          </Text>

          {/* Action Button */}
          <Section style={buttonContainer} className="button-container">
            <Button 
              href={`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/registration`} 
              style={button}
              className="button"
            >
              Complete Payment Now
            </Button>
          </Section>

          <Text style={paragraph} className="dark-mode-text">
            If you have already made the payment, please disregard this email. 
            If you encounter any issues or have questions, please contact our support team.
          </Text>

          <Text style={paragraph} className="dark-mode-text">
            Best regards,
            <br />
            <strong>REI Conference Team</strong>
          </Text>

          {/* Contact Information */}
          <Section style={contactSection} className="contact-section dark-mode-contact">
            <Text style={contactText} className="dark-mode-text">
              Need help? Contact us at:{' '}
              <Link href="mailto:rotaractearthinitiativeclub@gmail.com" style={contactLink}>
                rotaractearthinitiativeclub@gmail.com
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer} className="footer">
            <Text style={footerText} className="footer-text">
              © {new Date().getFullYear()} Rotaract Earth Initiative Conference. All rights reserved.
            </Text>
            <Text style={footerText} className="footer-text">
              This is an automated message. Please do not reply to this email.
            </Text>
            <Link 
              href="http://reiregistration.scintl.co.ug" 
              style={footerLink}
            >
              Visit our registration portal
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Base Styles (Desktop First)
const main = {
  backgroundColor: "#fff",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  padding: "20px 10px",
  margin: "0",
  width: "100%",
  WebkitTextSizeAdjust: "100%",
  MsTextSizeAdjust: "100%",
  minHeight: "100vh",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  maxWidth: "600px",
  width: "100%",
};

const header = {
  backgroundColor: "#f5f9f5ff",
  padding: "30px 20px",
  textAlign: "center" as const,
  borderRadius: "12px 12px 0 0",
};

const logo = {
  margin: "0 auto",
  display: "block",
  maxWidth: "120px",
  width: "100%",
  height: "auto",
};

const h1 = {
  color: "#333333",
  fontSize: "26px",
  fontWeight: "bold",
  margin: "30px 20px 20px",
  padding: "0",
  textAlign: "center" as const,
  lineHeight: "1.3",
};

const paragraph = {
  color: "#555555",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "16px 20px",
  textAlign: "left" as const,
};

const paymentSection = {
  backgroundColor: "#f8f9fa",
  margin: "20px",
  padding: "20px",
  borderRadius: "10px",
  borderLeft: "4px solid #2e7d32",
  maxWidth: "100%",
  overflow: "hidden",
  width: "auto", // Fit content width
  display: "block", // Ensure proper block display
};

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#333333",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
};

const paymentGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  width: "100%", // Ensure grid takes full width of container
};

const paymentItem = {
  textAlign: "center" as const,
  padding: "18px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "2px solid #e0e0e0",
  minHeight: "auto", // Fit content height
  height: "auto", // Fit content height
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "center",
  transition: "all 0.3s ease",
  width: "100%", // Ensure items take full grid cell width
};

const paymentLabel = {
  fontSize: "14px",
  color: "#666666",
  margin: "0 0 10px 0",
  fontWeight: "bold",
  lineHeight: "1.2",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const paymentValue = {
  fontSize: "20px",
  color: "#333333",
  margin: "0",
  fontWeight: "bold",
  lineHeight: "1.2",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "28px 20px",
  width: "auto", // Fit content width
};

const button = {
  backgroundColor: "#2e7d32",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "17px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block", // Fit content width
  padding: "16px 32px",
  margin: "0 auto",
  border: "none",
  cursor: "pointer",
  maxWidth: "100%",
  width: "auto", // Fit content width
  transition: "all 0.3s ease",
  whiteSpace: "nowrap" as const, // Prevent text wrapping
};

const contactSection = {
  margin: "20px",
  padding: "18px",
  backgroundColor: "#f0f7ff",
  borderRadius: "8px",
  border: "2px solid #d0e3ff",
  maxWidth: "100%",
  overflow: "hidden",
  width: "auto", // Fit content width
  display: "block", // Ensure proper block display
};

const contactText = {
  fontSize: "15px",
  color: "#555555",
  margin: "0",
  textAlign: "center" as const,
  lineHeight: "1.5",
  width: "100%", // Ensure text takes full width
};

const contactLink = {
  color: "#2e7d32",
  textDecoration: "underline",
  fontWeight: "bold",
};

const footer = {
  backgroundColor: "#f5f5f5",
  padding: "22px 20px",
  textAlign: "center" as const,
  borderRadius: "0 0 12px 12px",
  marginTop: "32px",
  width: "100%", // Ensure footer takes full width
};

const footerText = {
  fontSize: "12px",
  color: "#888888",
  margin: "6px 0",
  lineHeight: "1.4",
};

const footerLink = {
  color: "#2e7d32",
  textDecoration: "underline",
  fontSize: "12px",
  margin: "12px 0 0 0",
  display: "inline-block",
  fontWeight: "bold",
};

export default PaymentReminder;