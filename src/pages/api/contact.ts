import type { NextApiRequest, NextApiResponse } from 'next';
import * as aws from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed'});
  }

  const { name, email, message } = req.body;

  const ses = new aws.SES({
    apiVersion: '2010-12-01',
    region: 'AWS_REGION',
    credentials: {
      secretAccessKey: 'AWS_SES_SECRET_ACCESS_KEY',
      accessKeyId: 'AWS_SES_ACCESS_KEY_ID'
    }
  });

  const transporter = nodemailer.createTransport({
    SES: { ses, aws },
    sendingRate: 1, // max 1 messages/second,
    maxConnections: 1
  });

  try {
    await transporter.sendMail({
      from: 'EMAIL_FROM_ADDRESS',
      to: process.env.EMAIL_USER,
      subject: `New contact form submission from ${name}`,
      html: `<p>${message}</p>`,
    });

    res.status(200).json({ message: 'Email sent successfuly'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending email' });
  }
}