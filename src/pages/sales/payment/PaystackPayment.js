import { PaystackButton } from "react-paystack";
import api from "../../../Api/axios";

export default function PaystackPayment({ amount, email, onSuccess, orderId }) {
  const config = {
    reference: new Date().getTime(),
    email,
    amount: amount * 100,
    publicKey: "pk_test_xxxx",
  };

  return (
    <PaystackButton
      {...config}
      text="Pay Now"
      onSuccess={async (res) => {
        await api.post("/api/payment/update-ref", {
          order_id: orderId,
          reference: res.reference,
        });

        onSuccess(res.reference); // UI success only
      }}
      onClose={() => alert("Payment cancelled")}
      className="w-full bg-green-600 text-white py-3 rounded-lg"
    />
  );
}