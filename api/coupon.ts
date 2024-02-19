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

    return handleCreateCoupon(req, res);
}

async function handleCreateCoupon(req: VercelRequest, res: VercelResponse) {
    try {

        const promotionCodes = await stripe.promotionCodes.create({
            coupon: 'test',
        });

        res.json({ promotionCodes, message: 'Successfully created a promotion code' });
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
