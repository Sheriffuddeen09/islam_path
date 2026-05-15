import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../Api/axios";
import { Loader2 } from "lucide-react";

export default function VerifyTwoStep() {

  const location = useLocation();

  const navigate = useNavigate();

  const [pin, setPin] = useState("");

  const [loading, setLoading] = useState(false);

  const user_id = location.state?.user_id;

  const verifyPin = async () => {

    if (!pin || pin.length < 6) return;

    try {

      setLoading(true);

      const res = await api.post(
        "/api/verify-two-step",
        {
          user_id,
          pin,
        }
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      navigate(res.data.redirect);

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Invalid PIN"
      );

    } finally {

      setLoading(false);
    }
  };

  const isDisabled =
    loading || pin.length !== 6;

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-6 rounded-2xl shadow w-full max-w-sm">

        <h1 className="text-xl font-bold mb-4">
          Verify PIN
        </h1>

        <input
          type="password"
          maxLength={6}
          value={pin}
          onChange={(e) =>
            setPin(e.target.value)
          }
          placeholder="Enter 6-digit PIN"
          className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-black"
        />

        <button
          onClick={verifyPin}
          disabled={isDisabled}
          className={`w-full mt-4 flex items-center justify-center gap-2 rounded-xl p-3 text-white transition ${
            isDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >

          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying
            </>
          ) : (
            "Verify"
          )}

        </button>

      </div>

    </div>
  );
}