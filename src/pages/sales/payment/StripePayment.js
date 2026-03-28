import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";

const stripePromise = loadStripe("pk_test_xxx");

export default function StripePayment({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.post("/api/stripe/create-intent", { amount })
      .then(res => setClientSecret(res.data.clientSecret));
  }, [amount]);

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setLoading(true);

    const { paymentIntent, error } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      }
    );

    setLoading(false);

    if (error) {
      alert(error.message);
    } else if (paymentIntent.status === "succeeded") {

      // 🔥 THIS IS YOUR SUCCESS
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <div>
      <CardElement className="p-3 border rounded-lg mb-4" />

      <button
        onClick={handlePay}
        className="w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}
