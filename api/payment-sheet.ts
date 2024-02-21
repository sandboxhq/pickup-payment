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
    const { topUp } = req.body;

    // const customer = await stripe.customers.create();


    // if (code) {

    //   const coupons = await stripe.promotionCodes.list({ code: code });


    //   if (coupons.data.length === 0 || coupons.data[0].active === false || coupons.data[0].coupon.valid === false) {
    //     res.status(400).json({ error: 'Invalid or inactive coupon code' });
    //     return;
    //   }
    //   const coupon = await stripe.promotionCodes.retrieve(coupons.data[0].id);

    //   await stripe.promotionCodes.update(coupon.id, {
    //     metadata: {
    //       times_redeemed: coupon.metadata.times_redeemed + 1,
    //     },
    //   });
    //   console.log('done');
    // }

    // const ephemeralKey = await stripe.ephemeralKeys.create(
    //   { customer: customer.id },
    //   { apiVersion: '2023-10-16' }
    // );

    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: topUp,
    //   currency: 'php',
    //   customer: customer.id,
    //   automatic_payment_methods: {
    //     enabled: true,
    //   },
    // });
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
      // customer: customer.id,
      clientsecret: payment.client_secret
      // publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}