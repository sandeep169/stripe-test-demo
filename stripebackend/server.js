const cors = require("cors");
const express = require("express");

// This is your test secret API key.
const stripe = require('stripe')('sk_test_51KMn2fSDxEXjdd9VaNEwe6ilQUixVxUJ022BZLnSzJrAO4c1SrGBQ9HZwqYksazhXkuvIXQhaOV2jKbxMI2fLwga00fGOdHDkD')
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

app.post("/create-payment-intent", async (req, res) => {
    const { items } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency: "eur",
        automatic_payment_methods: {
            enabled: true,
        },
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
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