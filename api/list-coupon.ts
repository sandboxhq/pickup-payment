import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_API_KEY}`);

export default async function listCoupons(req: VercelRequest, res: VercelResponse) {
    try {
        const coupons = await stripe.coupons.list();

        const couponList = coupons.data.map((code) => ({
            code
        }));

        const couponId = 'cfOKDuin';
        await stripe.coupons.update(couponId, {
            metadata: {
                times_redeemed: 0
            },
        });


        res.json({ coupons: couponList });
    } catch (error) {
        console.error('Error listing code:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
