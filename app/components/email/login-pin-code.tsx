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
} from "@react-email/components";

interface MagicLoginProps {
  otp?: string;
  fullName?: string;
}

const MagicLogin = ({ otp, fullName }: MagicLoginProps) => {
  const main = {
    backgroundColor: "#f9f9f9",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  };

  const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "24px",
    marginBottom: "64px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  };

  const header = {
    backgroundColor: "#2e7d32", // Green color common for environmental initiatives
    borderRadius: "8px 8px 0 0",
    padding: "24px",
    textAlign: "center" as const,
  };

  const logo = {
    margin: "0 auto",
    width: "120px",
    height: "auto",
  };

  const h1 = {
    color: "#333333",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "32px 0 16px",
    padding: "0",
    textAlign: "center" as const,
  };

  const paragraph = {
    color: "#555555",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "16px 0",
    textAlign: "left" as const,
  };

  const pinContainer = {
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    padding: "16px",
    textAlign: "center" as const,
    margin: "24px 0",
    fontSize: "32px",
    fontWeight: "bold",
    color: "#2e7d32",
  };

  const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
    textAlign: "center" as const,
    marginTop: "32px",
  };

  const link = {
    color: "#2e7d32",
    textDecoration: "underline",
  };

  return (
    <Html>
      <Head />
      <Preview>Your Rotaract Earth Initiative Login PIN</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://firebasestorage.googleapis.com/v0/b/beacon-hostels.appspot.com/o/images%2Frota.png?alt=media&token=33d522ff-88b1-4096-a60a-b1f2665600e8" // Replace with actual logo URL
              width="120"
              height="auto"
              alt="Rotaract Earth Initiative Logo"
              style={logo}
            />
          </Section>
          <Heading style={h1}>ONE TIME LOGIN</Heading>
          <Text style={paragraph}>Hey, {fullName}</Text>
          <Text style={paragraph}>
            Just a quick reminder that your one-time login PIN is:
          </Text>
          <Section style={pinContainer}>{otp}</Section>
          <Text style={paragraph}>
            This PIN will expire shortly for security reasons. Please do not
            share it with anyone.
          </Text>
          <Text style={paragraph}>
            If you encounter any issues, don't hesitate to reach out to our
            friendly support team at{" "}
            <Link href="mailto:support@rotaract.com" style={link}>
              support@rotaract.com
            </Link>
            .
          </Text>
          <Text style={paragraph}>Happy logging in!</Text>
          <Text style={paragraph}>
            Yours truly,
            <br />
            <strong>Rotaract Earth Initiative</strong>
          </Text>
          <Text style={footer}>
            © {new Date().getFullYear()} Rotaract Earth Initiative. All rights
            reserved.
            <br />
            <Link href="https://rotaract.com/" style={link}>
              rotaract.com
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default MagicLogin;
