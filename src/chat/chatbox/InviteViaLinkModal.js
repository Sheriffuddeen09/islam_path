import { useState } from "react";
import api from "../../Api/axios";
import { toast } from "react-hot-toast";
import { Loader2, Link2Icon, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function InviteViaLinkModal({ chat, onClose }) {
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  const generateInviteLink = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/api/groups/${chat.id}/invite-link`);

      setInviteLink(res.data.invite_link);
      toast.success("Invite link generated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate link");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Copied!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center backdrop-blur-md justify-center z-50">

      <div className="bg-white w-80 rounded-lg shadow-lg p-4 relative">

        {/* ❌ CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
        >
          <X size={25} />
        </button>

        
        {/* TITLE */}
        <h2 className="text-center sm:text-lg font-semibold mb-3">
          Invite Via Link
        </h2>


        {/* 🔝 ICON */}
        <div className="flex justify-center mb-3">
         <div className="flex justify-center mt-4">
            <QRCodeCanvas value={inviteLink} size={160} />
        </div>
        </div>

        {/* GENERATE BUTTON (inside modal) */}
        {!inviteLink && !loading && (
          <button
            onClick={generateInviteLink}
            className="w-full bg-blue-500 text-white py-2 rounded"
          >
            Generate Link
          </button>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin" />
          </div>
        )}

        {/* LINK DISPLAY */}
        {inviteLink && (
          <div className="bg-gray-100 p-3 rounded text-center break-all mt-3">
            <p className="text-blue-600 text-sm">{inviteLink}</p>
          </div>
        )}

        

        {/* COPY BUTTON */}
        {inviteLink && (
          <button
            onClick={copyLink}
            className="mt-3 w-full bg-blue-500 text-white py-2 rounded"
          >
            Copy Link
          </button>
        )}
      </div>
    </div>
  );
}