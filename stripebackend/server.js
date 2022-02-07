const cors = require("cors");
const express = require("express");

// This is your test secret API key.
const stripe = require('stripe')('sk_test_51KMn2fSDxEXjdd9VFt2R9fQJJC6T9r1M58VCRPcxZfmAWfrtzzZxRb3biOqJBFG6ilJHSppNGhLJuDYrQ1t1ahHR00o8USmrbC')
// const {v4}  = require("uuid")
const { v4: uuidv4 } = require("uuid")

const app = express();
//middleware
app.use(express.json())
app.use(cors())

//routes
app.use(express.static("public"));
app.use(express.json());

const calculateOrderAmount = (items) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400;
};


const YOUR_DOMAIN = 'http://localhost:3000';


// const stripe = require('stripe')('sk_test_51KMn2fSDxEXjdd9VFt2R9fQJJC6T9r1M58VCRPcxZfmAWfrtzzZxRb3biOqJBFG6ilJHSppNGhLJuDYrQ1t1ahHR00o8USmrbC');

// const product = await stripe.products.create({name: 'T-shirt'});
// const price = await stripe.prices.create({
//     product: '{{PRODUCT_ID}}',
//     unit_amount: 2000,
//     currency: 'inr',
//   });

app.post('/create-checkout-session', async (req, res) => {


    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer: 'cus_L49MMGnHsNUDmm',
        // Country:'US',
        // customer_email:'sandeep.mamsys@mamsys.com',
        // payment_method: 'pm_1KO0fRSDxEXjdd9VPqSQCNj9',
        line_items: [
            {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                price: 'price_1KO17SSDxEXjdd9Ve0Tc6VkP',
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/?success=true`,
        cancel_url: `${YOUR_DOMAIN}?canceled=true`,
    });

    res.redirect(303, session.url);
});

app.post("/create-payment-intent", async (req, res) => {
    const { items } = req.body;
    // Create a PaymentIntent with the order amount and currency
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: calculateOrderAmount(items),
            // customer: 'cus_L49MMGnHsNUDmm',
            // payment_method: 'pm_1KO0fRSDxEXjdd9VPqSQCNj9',
            // confirm:true,
            currency: "eur",
            // payment_method_types: [
            //     "card",
            //     "acss_debit",
            //   ],
            // payment_method_types: [
            //     // 'bancontact',
            //     'card',  
            // ],
          
            // automatic_payment_methods: {
            //     enabled: true,
            // },
        });
        // console.log(res)
        res.send({

            clientSecret: paymentIntent.client_secret,
        });
    } catch (err) {
        console.log(err)
    }
});

app.listen(4242, () => console.log("Node server listening on port 8282!"));

app.get('/', (req, res) => {
    res.send("it worked")
})

app.post('/payment', (req, res) => {
    const { product, token } = req.body;
    console.log(" Product ::", product)
    console.log("Price: ", product.price);
    console.log("ammont: ", product.ammount)
    // old it was idempontency_key but in recent like below : used for tracking so that customer don't charge twice or more
    const idempontencyKey = uuidv4()
    return stripe.customers.create({
        email: token.email,
        source: token.id
    })
        .then(customer => {
            stripe.charges.create({
                amount: product.price * 100,
                currency: 'usd',
                customer: customer.id,
                receipt_email: token.email,
                description: `purchase of product.name`,
                shipping: {
                    name: token.card.name,
                    address: {
                        country: token.card.address_country
                    }
                }
            }, { idempontencyKey })
        })
        .then(result => res.status(200).json(result))
        .catch(err => console.log(err))

})

//listen

const port = 8282
app.listen(port, () => console.log("listening at :", port))