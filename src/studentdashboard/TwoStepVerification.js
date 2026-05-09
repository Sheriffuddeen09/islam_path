// TwoStepVerificationModal.jsx

import { useEffect, useState } from "react";
import api from "../Api/axios";
import {
  ShieldCheck,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
export default function TwoStepVerificationModal({
  onClose,
}) {

  const [loading, setLoading] =
    useState(false);

  const [enabled, setEnabled] =
    useState(false);

  const [pin, setPin] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {

    fetchStatus();

  }, []);

  const fetchStatus = async () => {

    try {

      const res = await api.get(
        "/api/two-step"
      );

      setEnabled(res.data.enabled);

    } catch (err) {

      console.error(err);

    }
  };

  const handleSave = async () => {

    if (pin.length !== 6) {
      toast.error("PIN must be 6 digits");
      return;
    }

    try {

      setLoading(true);

      if (enabled) {

        await api.post(
          "/api/two-step/change",
          { pin }
        );

        setSuccess(
          "PIN changed successfully"
        );
        

      } else {

        await api.post(
          "/api/two-step/setup",
          { pin }
        );

        setEnabled(true);

        setSuccess(
          "Two-step verification enabled"
        );
      }

      setPin("");

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  };

  const removeVerification = async () => {

    try {

      setLoading(true);

      await api.delete(
        "/api/two-step/remove"
      );

      setEnabled(false);

      setSuccess(
        "Two-step verification turned off"
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-y-auto">

      {/* HEADER */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-800">

        <button onClick={onClose}>
          ←
        </button>

        <h1 className="text-2xl">
          Two-step verification
        </h1>
      </div>

      {/* ICON */}
      <div className="flex justify-center mt-10">

        <div className="relative">

          <div className="bg-gray-100 rounded-xl px-10 py-5">

            <div className="text-black text-4xl tracking-[12px]">
              ***
            </div>

          </div>

          <div className="absolute -bottom-3 -left-3 bg-green-500 rounded-full p-2">

            <ShieldCheck
              className="text-black"
              size={30}
            />

          </div>
        </div>
      </div>

      {/* TEXT */}
      <div className="text-center mt-10 px-8">

        <p className="text-gray-300 text-lg">
          {enabled
            ? "Two-step verification is on."
            : "Protect your account with a PIN."}
        </p>

        <p className="text-gray-500 mt-3">
          You'll need this PIN when
          registering your number again.
        </p>
      </div>

      {/* INPUT */}
      <div className="px-6 mt-10">

        <input
          type="password"
          maxLength={6}
          value={pin}
          onChange={(e) =>
            setPin(
              e.target.value.replace(/\D/g, "")
            )
          }
          placeholder="Enter 6-digit PIN"
          className="w-full bg-transparent border border-gray-700 rounded-xl p-4 text-center text-2xl tracking-[10px] outline-none"
        />
      </div>

      {/* SUCCESS */}
      {success && (
        <div className="text-green-500 text-center mt-4">
          {success}
        </div>
      )}

      {/* ACTIONS */}
      <div className="mt-10 px-6 space-y-4">

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 rounded-xl p-4 font-semibold"
        >
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : enabled ? (
            "Change PIN"
          ) : (
            "Enable"
          )}
        </button>

        {enabled && (
          <button
            onClick={removeVerification}
            className="w-full border border-red-500 text-red-500 rounded-xl p-4 flex items-center justify-center gap-2"
          >
            <XCircle size={20} />
            Turn Off
          </button>
        )}
      </div>
    </div>
  );
}