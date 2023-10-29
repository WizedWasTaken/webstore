const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret_key);
const cors = require("cors")({ origin: true }); // Allows all origins

admin.initializeApp();

exports.createPaymentIntent = functions.https.onRequest((request, response) => {
  return cors(request, response, async () => {
    if (request.method !== "POST") {
      return response.status(405).send("Method Not Allowed");
    }

    if (!request.headers.authorization) {
      return response.status(403).send("Unauthorized");
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: request.body.amount,
        currency: "dkk",
      });
      return response
        .status(200)
        .send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent", error);
      return response.status(500).send("Internal Server Error");
    }
  });
});
