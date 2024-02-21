import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_API_KEY}`);

export default async function listCustomer (req:VercelRequest, res:VercelResponse){
    try{
        const customers = await stripe.customers.list();

        const customerList = customers.data.map((customer) => ({
            customer
        }));

        res.json({ customers: customerList });
    }catch(error){
        res.status(500).json({ error: 'Internal Server Error' });
    }
}