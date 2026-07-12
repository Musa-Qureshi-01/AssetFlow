import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
    if (transporter) return transporter;

    if (
        !process.env.SMTP_HOST ||
        !process.env.SMTP_USER ||
        !process.env.SMTP_PASS
    ) {
        console.warn("⚠ SMTP environment variables are not configured — emails will not be sent.");
        return null;
    }

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    return transporter;
}

export async function sendEmail(to: string, subject: string, html: string) {
    const mailer = getTransporter();

    if (!mailer) {
        console.warn(`Email not sent to ${to} (SMTP not configured)`);
        return;
    }

    await mailer.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
    });
}
