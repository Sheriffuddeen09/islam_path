import {
  ShieldCheck,
  Loader2,
  Fingerprint,
  Trash2,
  Plus,
} from "lucide-react";

import { useEffect, useState } from "react";
import api from "../Api/axios";
import { toast } from "react-hot-toast";

export default function PasskeyModal({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [passkeys, setPasskeys] = useState([]);

  

  // GET PASSKEYS
  const fetchPasskeys = async () => {
  try {
    const res = await api.get("/api/passkeys");

    setPasskeys(res.data.passkeys || []);
  } catch (err) {
    console.log(err);
    toast.error("Failed to load passkeys");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
    fetchPasskeys();
  }, []);


  // CREATE PASSKEY
  const createPasskey = async () => {
    try {
      setCreating(true);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),

          rp: { name: "Your Website" },

          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: "user@example.com",
            displayName: "User",
          },

          pubKeyCredParams: [{ type: "public-key", alg: -7 }],

          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },

          timeout: 60000,
          attestation: "none",
        },
      });

      const credentialId = btoa(
        String.fromCharCode(...new Uint8Array(credential.rawId))
      );

      await api.post("/api/passkeys", {
        credential_id: credentialId,
        public_key: JSON.stringify(credential),
        name: navigator.userAgent,
      });

      toast.success("Passkey created");

      await fetchPasskeys();
    } catch (err) {
      console.log(err);
      toast.error("Passkey creation failed");
    } finally {
      setCreating(false);
    }
  };

  // DELETE PASSKEY
  const removePasskey = async (id) => {
    try {
      setDeletingId(id);

      await api.delete(`/api/passkeys/${id}`);

      toast.success("Passkey removed");

      await fetchPasskeys();
    } catch (err) {
      console.log(err);
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md mx-auto mt-10 rounded-3xl overflow-hidden bg-[var(--bg-color)] text-[var(--text-color)] shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center gap-4 p-5 border-b border-gray-700">
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
          <h1 className="text-2xl font-semibold">Passkeys</h1>
        </div>

        {/* ICON */}
        <div className="flex justify-center mt-8">
          <div className="relative">
            <div className="bg-[var(--card-color)] rounded-2xl p-8">
              <Fingerprint size={70} className="text-green-500" />
            </div>

            <div className="absolute -bottom-2 -right-2 bg-green-600 rounded-full p-2">
              <ShieldCheck className="text-white" size={20} />
            </div>
          </div>
        </div>

        {/* TEXT */}
        <div className="text-center px-8 mt-8">
          <p className="text-lg font-semibold">Passkeys</p>
          <p className="text-sm opacity-70 mt-3">
            Manage your login devices using Face ID, fingerprint or device PIN.
          </p>
        </div>

        {/* LIST */}
        <div className="p-5 mt-6 space-y-4">

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : passkeys.length > 0 ? (
            passkeys.map((item) => (
              <div
                key={item.id}
                className="bg-[var(--card-color)] rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">Device Passkey</p>
                  <p className="text-sm opacity-70 truncate w-48">
                    {item.name}
                  </p>
                </div>

                <button
                  onClick={() => removePasskey(item.id)}
                  disabled={deletingId === item.id}
                  className="text-red-500"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Trash2 size={20} />
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 opacity-70">
              No passkeys added yet
            </div>
          )}
        </div>

        {/* ACTIONS (LIKE WHATSAPP) */}
        <div className="p-5 border-t border-gray-700 space-y-3">

          <button
            onClick={createPasskey}
            disabled={creating}
            className="w-full bg-green-600 hover:bg-green-700 rounded-2xl p-4 text-white font-semibold flex justify-center"
          >
            {creating ? (
              <Loader2 className="animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <Plus size={18} />
                Add Passkey
              </span>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}