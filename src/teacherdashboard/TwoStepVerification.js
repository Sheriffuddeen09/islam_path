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

  // SAVE / CHANGE / REMOVE LOADING
  const [loading, setLoading] =
    useState(false);

  // INITIAL FETCH LOADING
  const [
    statusLoading,
    setStatusLoading,
  ] = useState(true);

  // ENABLED STATUS
  const [enabled, setEnabled] =
    useState(false);

  // PIN INPUT
  const [pin, setPin] =
    useState("");

  // SUCCESS TEXT
  const [success, setSuccess] =
    useState("");

  // FETCH STATUS ON OPEN
  useEffect(() => {

    fetchStatus();

  }, []);

  // GET TWO STEP STATUS
  const fetchStatus = async () => {

    try {

      setStatusLoading(true);

      const res = await api.get(
        "/api/two-step"
      );

      // CONVERT 0/1 TO BOOLEAN
      setEnabled(
        Boolean(res.data.enabled)
      );

    } catch (err) {

      console.error(err);

      toast.error(
        "Failed to fetch status"
      );

    } finally {

      setStatusLoading(false);
    }
  };

  // ENABLE OR CHANGE PIN
  const handleSave = async () => {

    if (pin.length !== 6) {

      toast.error(
        "PIN must be 6 digits"
      );

      return;
    }

    try {

      setLoading(true);

      // CHANGE PIN
      if (enabled) {

        const res =
          await api.post(
            "/api/two-step/change",
            { pin }
          );

        toast.success(
          res.data.message
        );

        setSuccess(
          "PIN changed successfully"
        );

      } else {

        // ENABLE TWO STEP
        const res =
          await api.post(
            "/api/two-step/setup",
            { pin }
          );

        toast.success(
          res.data.message
        );

        setSuccess(
          "Two-step verification enabled"
        );

        setEnabled(true);
      }

      // CLEAR PIN
      setPin("");

      // REFRESH STATUS
      await fetchStatus();

    } catch (err) {

      console.error(err);

      toast.error(
        err?.response?.data
          ?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);
    }
  };

  // TURN OFF
  const removeVerification =
    async () => {

      try {

        setLoading(true);

        const res =
          await api.delete(
            "/api/two-step/remove"
          );

        toast.success(
          res.data.message
        );

        setEnabled(false);

        setSuccess(
          "Two-step verification turned off"
        );

        setPin("");

      } catch (err) {

        console.error(err);

        toast.error(
          err?.response?.data
            ?.message ||
          "Failed to turn off"
        );

      } finally {

        setLoading(false);
      }
    };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md overflow-y-auto">

      <div className="w-full max-w-md bg-[var(--bg-color)] text-[var(--text-color)] flex mx-auto mt-10 justify-center flex-col p-3 rounded-2xl overflow-y-auto shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-700">

          <button
            onClick={onClose}
            className="hover:opacity-70 transition"
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>

          </button>

          <h1 className="text-2xl font-semibold">
            Two-step verification
          </h1>
        </div>

        {/* ICON */}
        <div className="flex justify-center mt-6">

          <div className="relative">

            <div className="bg-[var(--card-color)] rounded-2xl px-10 py-4">

              <div className="text-4xl tracking-[12px]">
                ***
              </div>

            </div>

            <div className="absolute -bottom-3 -left-3 bg-[var(--bg-color)] rounded-full p-2 shadow-lg">

              <ShieldCheck
                className="text-green-500"
                size={30}
              />

            </div>
          </div>
        </div>

        {/* TEXT */}
        <div className="text-center mt-10 px-8">

          {statusLoading ? (

            <div className="flex justify-center">

              <Loader2 className="animate-spin" />

            </div>

          ) : (

            <>
              <p className="text-sm font-medium">

                {enabled
                  ? "Two-step verification is enabled."
                  : "Protect your account with a PIN."}

              </p>

              <p className="mt-3 text-sm opacity-80 leading-6">

                You'll need this PIN
                when logging in on a
                new device after
                30 days.

              </p>
            </>
          )}
        </div>

        {/* INPUT */}
        <div className="px-6 mt-10">

          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) =>
              setPin(
                e.target.value.replace(
                  /\D/g,
                  ""
                )
              )
            }
            placeholder={
              enabled
                ? "Enter new PIN"
                : "Enter 6-digit PIN"
            }
            disabled={
              statusLoading ||
              loading
            }
            className="w-full bg-transparent border border-gray-700 rounded-2xl p-4 text-center text-sm tracking-[10px] outline-none disabled:opacity-50"
          />
        </div>

        {/* SUCCESS */}
        {success && (

          <div className="text-green-500 text-center mt-4 text-sm">

            {success}

          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-10 px-6 space-y-4 pb-5">

          {/* ENABLE / CHANGE */}
          <button
            onClick={handleSave}
            disabled={
              loading ||
              statusLoading
            }
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 rounded-2xl p-4 font-semibold text-white transition"
          >

            {loading ||
            statusLoading ? (

              <div className="flex justify-center">

                <Loader2
                  className="animate-spin"
                  size={20}
                />

              </div>

            ) : enabled ? (
              "Change PIN"
            ) : (
              "Enable"
            )}
          </button>

          {/* TURN OFF */}
          {!statusLoading &&
            enabled && (

            <button
              onClick={
                removeVerification
              }
              disabled={loading}
              className="w-full border border-red-500 text-red-500 rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-red-500/10 disabled:opacity-60 transition"
            >

              {loading ? (

                <Loader2
                  className="animate-spin"
                  size={20}
                />

              ) : (

                <>
                  <XCircle
                    size={20}
                  />

                  Turn Off
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}