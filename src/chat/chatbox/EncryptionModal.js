import { useEffect, useState } from "react";

import {
  X,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  QrCode,
  Hash,
  Smartphone,
  Loader2,
} from "lucide-react";

import { QRCodeCanvas } from "qrcode.react";

import api from "../../Api/axios";

import {
  generateKeyPair,
  sha256,
} from "../../utils/encryption";

export default function EncryptionModal({
  open,
  onClose,
  chatId,
  activeChat,
}) {

  const [loading, setLoading] =
    useState(false);

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

  const [publicKey, setPublicKey] =
    useState("");

  const [privateKey, setPrivateKey] =
    useState("");

  const [securityNumber, setSecurityNumber] =
    useState("");

  // ============================================
  // SETUP ENCRYPTION
  // ============================================

  useEffect(() => {

    if (!open || !chatId) return;

    setupEncryption();

  }, [open, chatId]);

  const setupEncryption = async () => {

    try {

      setLoading(true);

      setStatus("pending");

      // ============================================
      // GENERATE DEVICE KEYS
      // ============================================

      const keys =
        await generateKeyPair();

      setPublicKey(keys.publicKey);

      setPrivateKey(keys.privateKey);

      // save private locally ONLY
      localStorage.setItem(
        "private_key",
        keys.privateKey
      );

      // ============================================
      // SAVE PUBLIC KEY
      // ============================================

      await api.post(
        "/api/save-public-key",
        {
          public_key:
            keys.publicKey,
        }
      );

      // ============================================
      // GENERATE CHAT KEY
      // ============================================

      await api.post(
        `/api/chats/${chatId}/generate-key`
      );

      // ============================================
      // FETCH VERIFICATION
      // ============================================

      const res = await api.get(
        `/api/chats/${chatId}/encryption`
      );

      setVerification(res.data);

      // ============================================
      // SECURITY NUMBER
      // ============================================

      const number = await sha256(
        keys.publicKey +
        res.data.security_code
      );

      setSecurityNumber(number);

      // ============================================
      // AUTO VERIFY
      // ============================================

      const verify = await api.post(
        `/api/chats/${chatId}/auto-verify`
      );

      if (verify.data.verified) {

        setStatus("verified");

      } else {

        setStatus("failed");
      }

    } catch (err) {

      console.error(err);

      setStatus("failed");

    } finally {

      setLoading(false);
    }
  };

  // ============================================
  // COPY SECURITY NUMBER
  // ============================================

  const copySecurityNumber =
    async () => {

    if (!securityNumber) return;

    await navigator.clipboard.writeText(
      securityNumber
    );

    setCopied(true);

    setTimeout(() => {

      setCopied(false);

    }, 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex justify-center items-center sm:p-4">

      <div className="w-full max-w-md sm:max-w-3xl sm:h-[600px] h-full rounded-xl scrollbar-thin bg-[#0b141a] text-white overflow-y-auto">

        {/* ============================================
            HEADER
        ============================================ */}

        <div className="sticky top-0 z-50 bg-[#0b141a] border-b border-white/10">

          <div className="flex items-center gap-4 px-4 py-4">

            <button
              onClick={onClose}
              className="text-white"
            >
              <X size={26} />
            </button>

            <div>

              <h2 className="text-xl font-semibold">
                Encryption
              </h2>

              <p className="text-xs text-white mt02">
                Messages and calls are end-to-end encrypted
              </p>
            </div>
          </div>
        </div>

        {/* ============================================
            BODY
        ============================================ */}

        <div className="px-6 py-6">

          {/* ============================================
              STATUS UI
          ============================================ */}

          {status === "pending" && (

            <div className="flex flex-col items-center text-center">

              <div className="w-40 h-40 rounded-full border-4 border-dashed border-green-500 flex items-center justify-center animate-spin mb-8">

                <div className="w-28 h-28 rounded-full bg-green-500/20 flex items-center justify-center">

                  <Loader2
                    size={60}
                    className="animate-spin text-green-400"
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-3">
                Verifying Encryption
              </h2>

              <p className="text-white  text-sm">
                Setting up secure encrypted communication...
              </p>
            </div>
          )}

          {/* ============================================
              VERIFIED
          ============================================ */}

          {status === "verified" && (

            <div className="flex flex-col items-center">

              <div className="relative">

                <div className="w-56 h-56 rounded-full bg-[#d9fdd3] flex items-center justify-center">

                  <div className="flex items-center gap-4">

                    <div className="w-16 h-32 bg-white rounded-xl border-4 border-black relative">

                      <div className="absolute top-5 left-4 w-8 h-3 rounded bg-green-500"></div>

                      <div className="absolute top-12 left-3 w-6 h-3 rounded bg-gray-300"></div>

                      <div className="absolute bottom-3 left-5 w-6 h-1 rounded bg-black"></div>
                    </div>

                    <div className="w-16 h-32 bg-white rounded-xl border-4 border-black relative">

                      <div className="absolute top-5 left-4 w-8 h-3 rounded bg-gray-300"></div>

                      <div className="absolute top-12 left-3 w-6 h-3 rounded bg-green-500"></div>

                      <div className="absolute bottom-3 left-5 w-6 h-1 rounded bg-black"></div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-green-500 flex items-center justify-center border-4 border-[#0b141a]">

                  <ShieldCheck
                    size={32}
                    className="text-black"
                  />
                </div>
              </div>

              <h2 className="mt-8 text-sm font-bold text-center">
                End-to-end encryption verified
              </h2>

              <p className="text-white text-xs text-center mt-2">
                Your messages with{" "}
                {activeChat?.name}
                {" "}are secured with encryption.
              </p>

              {/* ============================================
                  SECURITY INFO
              ============================================ */}

              <div className="w-full mt-8 space-y-4">

                <div className="bg-[#111b21] rounded-3xl p-5">

                  <div className="flex items-center gap-3 mb-4">

                    <Lock
                      size={22}
                      className="text-green-400"
                    />

                    <h3 className="font-semibold">
                      Encryption Details
                    </h3>
                  </div>

                  <div className="space-y-3 text-sm">

                    <div className="flex justify-between">

                      <span className="text-white">
                        Algorithm
                      </span>

                      <span>
                        AES-256 + RSA
                      </span>
                    </div>

                    <div className="flex justify-between">

                      <span className="text-white">
                        Key Exchange
                      </span>

                      <span>
                        Secure
                      </span>
                    </div>

                    <div className="flex justify-between">

                      <span className="text-white ">
                        Verification
                      </span>

                      <span className="text-green-400">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* ============================================
                    QR SECTION
                ============================================ */}

                <button
                  onClick={() => {

                    setShowQR(!showQR);

                    setShowNumber(false);
                  }}
                  className="w-full bg-[#111b21] rounded-3xl p-5 flex items-center justify-between"
                >

                  <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-2xl bg-black/20 flex items-center justify-center">

                      <QrCode size={30} />
                    </div>

                    <div className="text-left">

                      <p className="font-semibold text-sm">
                        Scan QR Code
                      </p>

                      <p className="text-sm text-white text-xs">
                        Verify with another device
                      </p>
                    </div>
                  </div>

                  <Smartphone size={22} />
                </button>

                {showQR && (

                  <div className="bg-white rounded-3xl p-6 flex justify-center">

                    <QRCodeCanvas
                      value={JSON.stringify({
                        security_number:
                          securityNumber,
                        chat_id: chatId,
                      })}
                      size={240}
                    />
                  </div>
                )}

                {/* ============================================
                    SECURITY NUMBER
                ============================================ */}

                <button
                  onClick={() => {

                    setShowNumber(
                      !showNumber
                    );

                    setShowQR(false);
                  }}
                  className="w-full bg-[#111b21] rounded-3xl p-5 flex items-center justify-between"
                >

                  <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-2xl bg-black/20 flex items-center justify-center">

                      <Hash size={28} />
                    </div>

                    <div className="text-left">

                      <p className="font-semibold text-sm">
                        Security Number
                      </p>

                      <p className="text-sm text-white text-xs">
                        Compare with recipient
                      </p>
                    </div>
                  </div>

                  <Lock size={22} />
                </button>

                {showNumber && (

                  <div className="bg-[#111b21] rounded-3xl p-5">

                    <div className="grid grid-cols-3 gap-3">

                      {securityNumber
                        ?.match(/.{1,5}/g)
                        ?.map((num, index) => (

                        <div
                          key={index}
                          className="bg-[#202c33] rounded-2xl py-4 text-center font-semibold text-sm"
                        >
                          {num}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={
                        copySecurityNumber
                      }
                      className="mt-5 flex items-center gap-2 text-sm text-gray-300"
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
                          Copy Security Number
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* ============================================
                    PUBLIC KEY
                ============================================ */}

                <div className="bg-[#111b21] rounded-3xl p-5">

                  <h3 className="font-semibold mb-3">
                    Public Key
                  </h3>

                  <div className="bg-[#202c33] rounded-2xl p-4 break-all text-xs text-gray-300 max-h-40 overflow-y-auto no-scrollbar">

                    {publicKey}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================
              FAILED
          ============================================ */}

          {status === "failed" && (

            <div className="flex flex-col items-center text-center">

              <div className="w-40 h-40 rounded-full border-[10px] border-red-500/20 flex items-center justify-center mb-8">

                <Lock
                  size={80}
                  className="text-red-400"
                />
              </div>

              <h2 className="text-2xl font-bold mb-3">
                Verification Failed
              </h2>

              <p className="text-white  text-sm">
                Could not verify encryption at this time.
              </p>

              <button
                onClick={setupEncryption}
                className="mt-8 bg-green-500 text-black font-semibold px-8 py-3 rounded-full"
              >
                Retry Verification
              </button>
            </div>
          )}

          {/* ============================================
              LOADING
          ============================================ */}

          {loading && (
            <div className="mt-6 text-center text-white  text-sm">
              Preparing secure encrypted session...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}