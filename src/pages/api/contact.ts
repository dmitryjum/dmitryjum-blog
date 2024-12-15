import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed'});
  }

  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD
    },
  });

  try {
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `New contact form submission from ${name}`,
      text: message,
      html: `<p>${message}</p>`,
    });

    res.status(200).json({ message: 'Email sent successfuly'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending email' });
  }
}