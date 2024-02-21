import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_API_KEY}`);

export default async function listCoupons(req: VercelRequest, res: VercelResponse) {
    try {
        const coupons = await stripe.promotionCodes.list();

        const couponList = coupons.data.map((code) => ({
            code
        }));

        res.json({ coupons: couponList });
    } catch (error) {
        console.error('Error listing code:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
