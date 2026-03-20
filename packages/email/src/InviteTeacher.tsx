import * as React from "react";
import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Hr, Img,
} from "@react-email/components";

interface InviteTeacherEmailProps {
  teacherName:  string;
  schoolName:   string;
  principalName: string;
  tempPassword: string;
  loginUrl:     string;
}

export function InviteTeacherEmail({
  teacherName,
  schoolName,
  principalName,
  tempPassword,
  loginUrl,
}: InviteTeacherEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={body}>
        <Container style={container}>
          {/* HEADER */}
          <Section style={header}>
            <Heading style={headerTitle}>EduCore RW</Heading>
            <Text style={headerSub}>School Management Platform · Rwanda</Text>
          </Section>

          {/* BODY */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              Welcome to {schoolName}
            </Heading>
            <Text style={p}>
              Dear <strong>{teacherName}</strong>,
            </Text>
            <Text style={p}>
              You have been added as a teacher at <strong>{schoolName}</strong> on the
              EduCore RW school management platform. Your account has been created by{" "}
              <strong>{principalName}</strong>.
            </Text>
            <Text style={p}>
              Use the credentials below to log in for the first time. You will be asked
              to set a new password immediately after signing in.
            </Text>

            {/* CREDENTIALS BOX */}
            <Section style={credBox}>
              <Text style={credLabel}>Your temporary credentials</Text>
              <Text style={credRow}>
                <span style={credKey}>Password:</span>{" "}
                <strong style={credValue}>{tempPassword}</strong>
              </Text>
              <Text style={credNote}>
                This password is temporary. Change it immediately after first login.
              </Text>
            </Section>

            <Button style={button} href={loginUrl}>
              Sign In to Teacher App
            </Button>

            <Hr style={hr} />

            <Text style={footer}>
              If you did not expect this invitation, please contact your school
              administration. Do not share your password with anyone.
            </Text>
            <Text style={footerSub}>
              EduCore RW · educorerw.rw · support@educorerw.rw
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#f4f1eb",
  fontFamily: "'Georgia', serif",
  margin: 0,
  padding: "24px 0",
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
};

const header: React.CSSProperties = {
  backgroundColor: "#1a3a2a",
  padding: "24px 32px",
  textAlign: "center",
};

const headerTitle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: 800,
  margin: 0,
  letterSpacing: "-0.02em",
  fontFamily: "sans-serif",
};

const headerSub: React.CSSProperties = {
  color: "rgba(255,255,255,0.55)",
  fontSize: "11px",
  margin: "4px 0 0",
  fontFamily: "monospace",
  letterSpacing: "0.08em",
};

const content: React.CSSProperties = {
  padding: "32px 32px 24px",
};

const h2: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#1a3a2a",
  margin: "0 0 16px",
};

const p: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#333",
  margin: "0 0 12px",
};

const credBox: React.CSSProperties = {
  backgroundColor: "#f4f1eb",
  border: "1px solid #d4cfc8",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "20px 0",
};

const credLabel: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "10px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#9a9a9a",
  margin: "0 0 8px",
};

const credRow: React.CSSProperties = {
  fontSize: "15px",
  color: "#333",
  margin: "0 0 8px",
};

const credKey: React.CSSProperties = {
  color: "#666",
};

const credValue: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "16px",
  color: "#1a3a2a",
  letterSpacing: "0.04em",
};

const credNote: React.CSSProperties = {
  fontSize: "12px",
  color: "#999",
  margin: 0,
  fontStyle: "italic",
};

const button: React.CSSProperties = {
  backgroundColor: "#1a3a2a",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "sans-serif",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  textDecoration: "none",
  padding: "12px 28px",
  borderRadius: "6px",
  display: "inline-block",
  margin: "8px 0 20px",
};

const hr: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #e4e0da",
  margin: "20px 0",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#999",
  lineHeight: "1.6",
  margin: "0 0 8px",
};

const footerSub: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "10px",
  color: "#bbb",
  margin: 0,
};
