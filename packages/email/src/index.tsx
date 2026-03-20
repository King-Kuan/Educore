import * as React from "react";
import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Hr,
} from "@react-email/components";
import { Resend } from "resend";
import { InviteTeacherEmail } from "./InviteTeacher";

// ─── RESEND CLIENT ────────────────────────────────────────────────────────

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY!);
}

const FROM    = () => process.env.RESEND_FROM_EMAIL    ?? "onboarding@resend.dev";
const REPLY   = () => process.env.RESEND_REPLY_TO      ?? "kuanjoeking@gmail.com";
const APP_URL = () => process.env.NEXT_PUBLIC_TEACHER_APP_URL ?? "https://app.educorerw.rw";
const ADMIN_URL = () => process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://admin.educorerw.rw";

// ─── SEND TEACHER INVITE ─────────────────────────────────────────────────

export async function sendTeacherInvite(params: {
  toEmail:       string;
  teacherName:   string;
  schoolName:    string;
  principalName: string;
  tempPassword:  string;
}) {
  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from:     FROM(),
    replyTo:  REPLY(),
    to:       params.toEmail,
    subject:  `You've been added to ${params.schoolName} — EduCore RW`,
    react:    React.createElement(InviteTeacherEmail, {
      teacherName:   params.teacherName,
      schoolName:    params.schoolName,
      principalName: params.principalName,
      tempPassword:  params.tempPassword,
      loginUrl:      `${APP_URL()}/login`,
    }),
  });

  if (error) throw new Error(`Failed to send teacher invite: ${error.message}`);
  return data;
}

// ─── SEND PRINCIPAL WELCOME ───────────────────────────────────────────────

export async function sendPrincipalWelcome(params: {
  toEmail:       string;
  principalName: string;
  schoolName:    string;
  tempPassword:  string;
}) {
  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from:    FROM(),
    replyTo: REPLY(),
    to:      params.toEmail,
    subject: `Your EduCore RW school account is ready — ${params.schoolName}`,
    react:   React.createElement(PrincipalWelcomeEmail, params),
  });

  if (error) throw new Error(`Failed to send principal welcome: ${error.message}`);
  return data;
}

// ─── SEND SUBSCRIPTION REMINDER ───────────────────────────────────────────

export async function sendSubscriptionReminder(params: {
  toEmail:       string;
  principalName: string;
  schoolName:    string;
  amountRwf:     number;
  dueDate:       string;
  daysLeft:      number;
}) {
  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from:    FROM(),
    replyTo: REPLY(),
    to:      params.toEmail,
    subject: `Subscription renewal due — ${params.schoolName}`,
    html: `
      <p>Dear ${params.principalName},</p>
      <p>Your EduCore RW subscription for <strong>${params.schoolName}</strong> is due in
      <strong>${params.daysLeft} days</strong> (${params.dueDate}).</p>
      <p>Amount due: <strong>${params.amountRwf.toLocaleString()} Rwf</strong></p>
      <p>Please contact us at support@educorerw.rw to renew.</p>
    `,
  });

  if (error) throw new Error(`Failed to send subscription reminder: ${error.message}`);
  return data;
}

// ─── PRINCIPAL WELCOME EMAIL COMPONENT ───────────────────────────────────

function PrincipalWelcomeEmail({
  principalName,
  schoolName,
  tempPassword,
}: {
  toEmail:       string;
  principalName: string;
  schoolName:    string;
  tempPassword:  string;
}) {
  return (
    <Html lang="en">
      <Head />
      <Body style={{ backgroundColor: "#f4f1eb", margin: 0, padding: "24px 0", fontFamily: "Georgia, serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#fff", borderRadius: "8px", overflow: "hidden" }}>
          <Section style={{ backgroundColor: "#1a3a2a", padding: "24px 32px", textAlign: "center" }}>
            <Heading style={{ color: "#fff", fontSize: "24px", fontWeight: 800, margin: 0 }}>EduCore RW</Heading>
            <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px", margin: "4px 0 0", fontFamily: "monospace" }}>
              School Management Platform · Rwanda
            </Text>
          </Section>
          <Section style={{ padding: "32px" }}>
            <Heading as="h2" style={{ fontSize: "20px", color: "#1a3a2a", margin: "0 0 16px" }}>
              Your school account is ready
            </Heading>
            <Text style={{ fontSize: "15px", lineHeight: "1.7", color: "#333", margin: "0 0 12px" }}>
              Dear <strong>{principalName}</strong>,
            </Text>
            <Text style={{ fontSize: "15px", lineHeight: "1.7", color: "#333", margin: "0 0 12px" }}>
              Your EduCore RW account for <strong>{schoolName}</strong> has been approved and
              is ready to use. You can now log in to your principal dashboard to set up your
              school — add teachers, create classes, import students, and more.
            </Text>
            <Section style={{ backgroundColor: "#f4f1eb", border: "1px solid #d4cfc8", borderRadius: "8px", padding: "16px 20px", margin: "20px 0" }}>
              <Text style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a9a9a", margin: "0 0 8px" }}>
                Temporary password
              </Text>
              <Text style={{ fontFamily: "monospace", fontSize: "18px", color: "#1a3a2a", fontWeight: "bold", margin: 0 }}>
                {tempPassword}
              </Text>
            </Section>
            <Button
              href={`${ADMIN_URL()}/login`}
              style={{ backgroundColor: "#1a3a2a", color: "#fff", fontSize: "13px", fontFamily: "sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 28px", borderRadius: "6px", display: "inline-block" }}
            >
              Open Principal Dashboard
            </Button>
            <Hr style={{ border: "none", borderTop: "1px solid #e4e0da", margin: "20px 0" }} />
            <Text style={{ fontSize: "12px", color: "#999" }}>
              EduCore RW · educorerw.rw · support@educorerw.rw
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
