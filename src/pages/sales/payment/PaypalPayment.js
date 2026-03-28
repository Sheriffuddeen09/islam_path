import { PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import api from "../../../Api/axios";

export default function PaypalPayment({ amount, orderId, onSuccess }) {
  return (
    <PayPalButtons
      createOrder={(data, actions) =>
        actions.order.create({
          purchase_units: [{ amount: { value: amount } }],
        })
      }

      onApprove={(data, actions) =>
        actions.order.capture().then(async (details) => {

          // ✅ STEP 1: SAVE REFERENCE TO YOUR DB
          await axios.post("/api/payment/update-ref", {
            order_id: orderId,
            reference: details.id,
          });

          // ✅ STEP 2: VERIFY PAYMENT + SEND EMAIL
          await api.post("/api/paypal/verify", {
            reference: details.id,
          });

          // ✅ STEP 3: UI SUCCESS
          onSuccess(details.id);
        })
      }
    />
  );
}