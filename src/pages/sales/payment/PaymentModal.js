import PaystackPayment from "./PaystackPayment";
import StripePayment from "./StripePayment";
import PaypalPayment from "./PaypalPayment";

export default function PaymentModal({
  method,
  amount,
  email,
  onSuccess,
  onClose,
  orderId

}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md relative">

        <button onClick={onClose} className="absolute right-4 top-2">
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">
          Complete Payment
        </h2>

        {method === "paystack" && (
          <PaystackPayment amount={amount} email={email} onSuccess={onSuccess}
          orderId={orderId}
            />
        )}

        {method === "stripe" && (
          <StripePayment amount={amount} onSuccess={onSuccess} 
          orderId={orderId}
          />
        )}

        {method === "paypal" && (
          <PaypalPayment amount={amount} onSuccess={onSuccess} 
          orderId={orderId}
          />
        )}
      </div>
    </div>
  );
}