import type { NextApiRequest, NextApiResponse } from 'next';
import * as aws from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed'});
  }

  const { name, email, message } = req.body;

  const region = process.env.AWS_REGION;
  const secretAccessKey = process.env.AWS_SES_SECRET_ACCESS_KEY;
  const accessKeyId = process.env.AWS_SES_ACCESS_KEY_ID;

  if (!region || !secretAccessKey || !accessKeyId) {
    return res.status(500).json({ message: 'AWS credentials are not configured properly.' });
  }

  const ses = new aws.SES({
    apiVersion: '2010-12-01',
    region,
    credentials: {
      secretAccessKey,
      accessKeyId
    }
  });

  const transporter = nodemailer.createTransport({
    SES: { ses, aws },
    sendingRate: 1, // max 1 messages/second,
    maxConnections: 1
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM_ADDRESS,
      to: process.env.EMAIL_FROM_ADDRESS,
      subject: `New contact form submission from ${name} at ${email}`,
      html: `<p>${message}</p>`,
    },(err, info) => {
      if (err) {
        console.error("email failed to send", err)
      } else {
        console.log("Delivery envelope", info.envelope);
        console.log("Delivery message id", info.messageId);
        res.status(200).json({ message: 'Email sent successfuly'});
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending email' });
  }
}