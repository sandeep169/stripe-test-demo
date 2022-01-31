const cors = require("cors");
const express = require ("express");

const stripe = require('stripe')('sk_test_51KMn2fSDxEXjdd9VaNEwe6ilQUixVxUJ022BZLnSzJrAO4c1SrGBQ9HZwqYksazhXkuvIXQhaOV2jKbxMI2fLwga00fGOdHDkD')
// const {v4}  = require("uuid")
const {v4 : uuidv4}  = require("uuid")

const app = express();
//middleware
app.use(express.json())
app.use(cors())

//routes

app.get('/',(req, res) =>{
    res.send("it worked")
})

app.post('/payment', (req, res) => {
    const { product, token} = req.body;
    console.log(" Product ::",product)
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
            amount: product.price*100,
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
        }, {idempontencyKey})
    })
    .then (result => res.status(200).json(result))
    .catch(err => console.log(err) )

})

//listen

const port = 8282
app.listen(port, () => console.log("listening at :", port))