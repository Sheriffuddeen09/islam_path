import { X, Loader2 } from "lucide-react";
import { useState } from "react";
import api from "../../Api/axios";
import { toast } from "react-hot-toast";

export default function ExitGroupModal({ chat, onClose }) {
  const [loading, setLoading] = useState(false);

  const exitGroup = async () => {
    try {
      setLoading(true);

      await api.post(`/api/groups/${chat.id}/exit`);

      toast.success("You left the group");

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to exit group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex px-2 items-center justify-center z-50">
      <div className="bg-white w-80 rounded-xl py-4 shadow-lg">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-3 py-3 px-4">
          <h2 className="font-semibold">Exit Group</h2>
          <button onClick={onClose}>
            <X size={26} />
          </button>
        </div>

        {/* BODY */}
        <p className="text-sm text-gray-800 mb-4 py-2 border text-center p">
          Are you sure you want to exit this Group? 
          <br />
          You won't be able to have access to this Group anymore.
        </p>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 py-3 px-4">
         
          <button
            onClick={exitGroup}
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Exit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}