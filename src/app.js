require('dotenv').config();
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({
  origin: process.env.ORIGIN
}));
app.set('trust proxy', true);
app.use(express.static('public'));

app.get('/test-45dfg5345fg', (req, res) => {
  res.send('Ok');
});

app.get('/user-data', async (req, res) => {
  const { data, status } = await axios.get(`https://api.ipinfo.io/lite/${req.ip}?token=323c86741dda64`);

  if (status === 200 && data.country_code) {
    return res.status(200).json({
      ip: data.ip,
      country_code: data.country_code
    });
  }

  res.sendStatus(400);
});

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'custom',
    line_items: [
      {
        // Provide the exact Price ID (for example, price_1234) of the product you want to sell
        price: process.env.PRICE_ID,
        quantity: 1,
      },
    ],
    mode: 'payment',
    return_url: `${process.env.ORIGIN}/onboarding/deposit/complete?session_id={CHECKOUT_SESSION_ID}`,
  });

  res.send({ clientSecret: session.client_secret });
});

app.get('/session-status', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  res.send({
    status: session.status,
    payment_status: session.payment_status,
    payment_intent_id: session.payment_intent.id,
    payment_intent_status: session.payment_intent.status
  });
});

app.listen(4242, () => console.log('Running on port 4242'));