import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();


const stripe = new Stripe(`${process.env.STRIPE_API_KEY}`);

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ error: 'Method Not Allowed', allowedMethods: ['POST'] });
  }

  return handlePayment(req, res);
}

async function handlePayment(req: VercelRequest, res: VercelResponse) {
  try {
    const { topUp, code } = req.body;
    const customer = await stripe.customers.create();
    let paymentAmount = topUp;
    if (code) {
      const coupon = await stripe.coupons.retrieve(code);
      if (!coupon || !coupon.valid) {
        return res.status(400).json({ error: 'Invalid coupon' });
      }

      await stripe.coupons.update(code, {
        metadata: {
          times_redeemed: + 1,
        }
      });

      if (coupon.percent_off === 100) {
        paymentAmount = 3000;
      } else if (coupon.percent_off) {
        const calcuAmount = (coupon.percent_off / 100) * topUp;
        if (calcuAmount <= 3000) {
          paymentAmount = 3000
        } else {
          paymentAmount = calcuAmount;
        }
      }

      const payment = await stripe.checkout.sessions.create({
        line_items: [{
          price_data: {
            currency: 'php',
            product_data: {
              name: 'ticket',
            },
            unit_amount: paymentAmount,
          },
          quantity: 1
        }],
        mode: 'payment',
        ui_mode: 'embedded',
        return_url: 'http://localhost:8080/',
      })
      res.json({
        // paymentIntent: paymentIntent.client_secret,
        // ephemeralKey: ephemeralKey.secret,
        paymentIntent: payment.client_secret,
        customer: customer.id,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        message: `The user pay amount:${paymentAmount / 100}pesos`
      });
    } else {
      const payment = await stripe.checkout.sessions.create({
        line_items: [{
          price_data: {
            currency: 'php',
            product_data: {
              name: 'ticket',
            },
            unit_amount: topUp,
          },
          quantity: 1
        }],
        mode: 'payment',
        ui_mode: 'embedded',
        return_url: 'http://localhost:8000/'
      })
      res.json({
        // paymentIntent: paymentIntent.client_secret,
        // ephemeralKey: ephemeralKey.secret,
        paymentIntent: payment.client_secret,
        customer: customer.id,
        clientsecret: payment.client_secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        message: `The user pay amount: ${topUp / 100} pesos`
      });
    }

  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}