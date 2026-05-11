import { useEffect, useState } from "react";
import {
  X,
  AlertCircle,
  QrCode,
  Hash,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";

import QRCode from "react-qr-code";

import api from "../../Api/axios";

export default function EncryptionModal({
  open,
  onClose,
  chatId,
  activeChat,
}) {

  const [loading, setLoading] =
    useState(false);

  const [verification, setVerification] =
    useState(null);

  const [copied, setCopied] =
    useState(false);

  const [showQR, setShowQR] =
    useState(false);

  const [showNumber, setShowNumber] =
    useState(false);

  const [verified, setVerified] =
    useState(false);

  // ================= FETCH =================
  useEffect(() => {

    if (!open || !chatId) return;

    fetchVerification();

  }, [open, chatId]);

  const fetchVerification = async () => {

    try {

      setLoading(true);

      const res = await api.get(
        `/api/chats/${chatId}/encryption`
      );

      setVerification(res.data);

      setVerified(
        res.data.verified
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  };

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

  const verifyEncryption = async () => {

    try {

      await api.post(
        `/api/chats/${chatId}/verify-encryption`
      );

      setVerified(true);

    } catch (err) {

      console.error(err);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 flex items-center justify-center">

      <div className="bg-[#0b141a] w-full h-full sm:h-auto sm:max-w-md sm:rounded-2xl overflow-hidden text-white overflow-y-auto">

        {/* HEADER */}
        <div className="flex items-center gap-4 px-4 py-4 border-b border-white/10 sticky top-0 bg-[#0b141a]">

          <button onClick={onClose}>
            <X size={24} />
          </button>

          <div>
            <h2 className="text-lg font-semibold">
              Verify encryption
            </h2>

            <p className="text-sm text-gray-400">
              You, {activeChat?.name}
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6">

          {/* VERIFIED */}
          {verified ? (

            <div className="flex flex-col items-center justify-center text-center">

              <div className="w-36 h-36 rounded-full border-[10px] border-green-500 flex items-center justify-center mb-6">

                <ShieldCheck
                  size={80}
                  className="text-green-500"
                />
              </div>

              <h3 className="text-3xl font-bold mb-3">
                Encryption Verified
              </h3>

              <p className="text-gray-400 text-lg">
                Your messages and calls are
                end-to-end encrypted.
              </p>
            </div>

          ) : (

            <>
              {/* ICON */}
              <div className="flex justify-center mb-8">

                <div className="w-36 h-36 rounded-full border-[10px] border-gray-400 flex items-center justify-center">

                  <AlertCircle
                    size={80}
                    className="text-gray-400"
                  />
                </div>
              </div>

              {/* TEXT */}
              <div className="text-center">

                <h3 className="text-3xl font-bold mb-4">
                  Please verify another way
                </h3>

                <p className="text-gray-400 text-lg leading-8">
                  We can't automatically
                  verify end-to-end
                  encryption at this time.
                </p>
              </div>
            </>
          )}

          {/* OPTIONS */}
          <div className="mt-14 border-t border-white/10 pt-8">

            <p className="text-gray-400 font-semibold mb-8">
              Other ways to verify
              encryption
            </p>

            {/* QR BUTTON */}
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

              <span className="text-xl">
                Scan a QR code
              </span>
            </button>

            {/* QR DISPLAY */}
            {showQR &&
              verification?.security_code && (

              <div className="bg-white rounded-2xl p-6 flex flex-col items-center mt-4">

                <QRCode
                  value={
                    verification.security_code
                  }
                  size={220}
                />

                <button
                  onClick={verifyEncryption}
                  className="mt-6 bg-green-600 hover:bg-green-700 transition px-5 py-3 rounded-full text-white font-semibold"
                >
                  Mark as Verified
                </button>
              </div>
            )}

            {/* NUMBER BUTTON */}
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

              <span className="text-xl">
                Compare a 60-digit number
              </span>
            </button>

            {/* NUMBER DISPLAY */}
            {showNumber &&
              verification?.security_code && (

              <div className="bg-[#111b21] rounded-2xl p-5 mt-4 border border-white/10">

                <div className="grid grid-cols-3 gap-3 text-center">

                  {verification.security_code
                    .split(" ")
                    .map((num, index) => (

                    <div
                      key={index}
                      className="bg-[#202c33] rounded-xl py-3 text-lg font-semibold tracking-wider"
                    >
                      {num}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-5">

                  <button
                    onClick={copyNumber}
                    className="flex items-center gap-2 text-gray-300"
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

                  <button
                    onClick={verifyEncryption}
                    className="bg-green-600 hover:bg-green-700 transition px-5 py-2 rounded-full"
                  >
                    Verified
                  </button>
                </div>
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="text-center text-gray-400 mt-6">
                Loading encryption...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}