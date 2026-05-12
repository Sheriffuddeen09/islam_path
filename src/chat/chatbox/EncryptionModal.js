import { useEffect, useState } from "react";

import {
  X,
  QrCode,
  Hash,
  Copy,
  Check,
  Smartphone,
  Lock,
} from "lucide-react";

import { QRCodeCanvas } from "qrcode.react";


import api from "../../Api/axios";

export default function EncryptionModal({
  open,
  onClose,
  chatId,
  activeChat,
}) {

  const [loading, setLoading] =
    useState(false);

  // pending | verified | failed
  const [status, setStatus] =
    useState("pending");

  const [verification, setVerification] =
    useState(null);

  const [showQR, setShowQR] =
    useState(false);

  const [showNumber, setShowNumber] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  // ================= OPEN =================
  useEffect(() => {

    if (!open || !chatId) return;

    fetchVerification();

  }, [open, chatId]);

  // ================= FETCH =================
  const fetchVerification = async () => {

    try {

      setLoading(true);

      // 🔥 START VERIFYING
      setStatus("pending");

      const res = await api.get(
        `/api/chats/${chatId}/encryption`
      );

      setVerification(res.data);

      // 🔥 simulate verification delay
      setTimeout(async () => {

        try {

          const verify =
            await api.post(
              `/api/chats/${chatId}/auto-verify`
            );

          // 🔥 SUCCESS
          if (verify.data.verified) {

            setStatus("verified");

          } else {

            // 🔥 FAILED
            setStatus("failed");
          }

        } catch (err) {

          console.error(err);

          setStatus("failed");
        }

      }, 2500);

    } catch (err) {

      console.error(err);

      setStatus("failed");

    } finally {

      setLoading(false);
    }
  };

  // ================= COPY =================
  const copyNumber = async () => {

    if (!verification?.security_code)
      return;

    await navigator.clipboard.writeText(
      verification.security_code
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black flex justify-center">

      <div className="w-full max-w-md h-full bg-[#0b141a] text-white overflow-y-auto">

        {/* HEADER */}
        <div className="flex items-center gap-4 px-4 py-4 border-b border-white/10">

          <button onClick={onClose}>
            <X size={26} />
          </button>

          <div>

            <h2 className="text-xl font-semibold">
              Verify encryption
            </h2>

            <p className="text-sm text-gray-400">
              You, {activeChat?.name}
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="px-6 py-10">

          {/* ================= PENDING ================= */}
          {status === "pending" && (

            <div className="flex flex-col items-center text-center">

              {/* ANIMATION */}
              <div className="relative mb-10">

                <div className="w-52 h-52 rounded-full border-2 border-dashed border-gray-300 animate-spin-slow flex items-center justify-center">

                  <div className="flex items-center gap-3">

                    <div className="w-16 h-28 rounded-lg bg-gray-100 relative border-2 border-gray-300">

                      <div className="absolute top-5 left-4 w-8 h-4 bg-gray-300 rounded"></div>

                      <div className="absolute top-12 left-3 w-6 h-4 bg-gray-300 rounded"></div>

                      <div className="absolute bottom-3 left-5 w-6 h-1 bg-gray-700 rounded"></div>
                    </div>

                    <div className="w-16 h-28 rounded-lg bg-gray-100 relative border-2 border-gray-300">

                      <div className="absolute top-5 left-4 w-8 h-4 bg-gray-300 rounded"></div>

                      <div className="absolute top-12 left-7 w-6 h-4 bg-gray-300 rounded"></div>

                      <div className="absolute bottom-3 left-5 w-6 h-1 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-7 right-5 w-5 h-5 rounded-full bg-green-500"></div>
              </div>

              <h3 className="text-4xl font-bold text-gray-400">
                Verifying
              </h3>
            </div>
          )}

          {/* ================= VERIFIED ================= */}
          {status === "verified" && (

            <div className="flex flex-col items-center text-center">

              <div className="relative mb-10">

                <div className="w-56 h-56 rounded-full bg-[#dbe8d1] flex items-center justify-center relative">

                  {/* PHONES */}
                  <div className="flex items-center gap-3">

                    <div className="w-16 h-28 rounded-lg bg-gray-100 relative border-2 border-gray-700">

                      <div className="absolute top-5 left-4 w-8 h-4 bg-green-500 rounded"></div>

                      <div className="absolute top-12 left-2 w-5 h-4 bg-[#d8cfc3] rounded"></div>

                      <div className="absolute bottom-3 left-5 w-6 h-1 bg-gray-700 rounded"></div>
                    </div>

                    <div className="w-16 h-36 rounded-lg bg-gray-100 relative border-2 border-gray-700">

                      <div className="absolute top-5 left-4 w-8 h-4 bg-[#d8cfc3] rounded"></div>

                      <div className="absolute top-12 left-2 w-5 h-4 bg-green-500 rounded"></div>

                      <div className="absolute bottom-3 left-5 w-6 h-1 bg-gray-700 rounded"></div>
                    </div>
                  </div>

                  {/* LOCK */}
                  <div className="absolute bottom-3 right-3 w-16 h-16 rounded-full bg-green-500 flex items-center justify-center border-4 border-[#0b141a]">

                    <Lock
                      size={34}
                      className="text-black"
                    />
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-bold mb-5">
                End-to-end encryption was automatically verified
              </h3>

              <p className="text-gray-400 text-sm">
                Today at{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* ================= FAILED ================= */}
          {status === "failed" && (

            <div className="text-center">

              <div className="flex justify-center mb-8">

                <div className="w-40 h-40 rounded-full border-[10px] border-gray-500 flex items-center justify-center">

                  <Lock
                    size={80}
                    className="text-gray-400"
                  />
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4">
                Please verify another way
              </h3>

              <p className="text-gray-200 text-sm leading-3">
                We can't automatically
                verify end-to-end
                encryption at this time.
              </p>
            </div>
          )}

          {/* OPTIONS */}
          <div className="mt-6 border-t border-white/10 pt-4">

            <p className="text-gray-400 font-semibold mb-4 text-sm">
              Other ways to verify encryption
            </p>

            {/* QR */}
            <button
              onClick={() => {

                setShowQR(prev => !prev);

                setShowNumber(false);
              }}
              className="w-full flex items-center gap-5 py-5"
            >
              <div className="w-12 h-12 rounded-lg border border-white/20 flex items-center justify-center">

                <QrCode size={28} />
              </div>

              <span className="text-sm">
                Scan a QR code
              </span>
            </button>

            {showQR &&
              verification?.security_code && (

              <div className="bg-white rounded-2xl p-6 flex justify-center mt-4">

                <QRCodeCanvas
                  value={
                    verification.security_code
                  }
                  size={220}
                />
              </div>
            )}

            {/* NUMBER */}
            <button
              onClick={() => {

                setShowNumber(prev => !prev);

                setShowQR(false);
              }}
              className="w-full flex items-center gap-5 py-5"
            >
              <div className="w-12 h-12 rounded-lg border border-white/20 flex items-center justify-center">

                <Hash size={28} />
              </div>

              <span className="text-sm">
                Compare a 60-digit number
              </span>
            </button>

            {showNumber &&
              verification?.security_code && (

              <div className="bg-[#111b21] rounded-2xl p-5 mt-4">

                <div className="grid grid-cols-3 gap-3">

                  {verification.security_code
                    .split(" ")
                    .map((num, index) => (

                    <div
                      key={index}
                      className="bg-[#202c33] rounded-xl py-3 text-center font-semibold"
                    >
                      {num}
                    </div>
                  ))}
                </div>

                <button
                  onClick={copyNumber}
                  className="mt-5 flex items-center gap-2 text-gray-300"
                >
                  {copied ? (
                    <>
                      <Check
                        size={18}
                        className="text-green-500"
                      />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copy number
                    </>
                  )}
                </button>
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="text-center text-gray-400 mt-6">
                Loading encryption
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CUSTOM ANIMATION */}
      <style>
        {`
          .animate-spin-slow {
            animation: spin 8s linear infinite;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}