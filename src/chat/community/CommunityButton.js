// CommunityButton.jsx

import {
  Plus,
  Users,
  Megaphone
} from "lucide-react";

import {
  useEffect,
  useState
} from "react";

export default function CommunityButton({

  chatListRef,
  onOpenCommunity,
  onOpenChannel,

}) {

  const [visible, setVisible] =
    useState(true);

  const [open, setOpen] =
    useState(false);

  useEffect(() => {

    const container =
      chatListRef?.current;

    if (!container) return;

    let lastScroll = 0;

    const handleScroll = () => {

      const current =
        container.scrollTop;

      // ✅ SCROLL DOWN
      if (current > lastScroll) {

        setVisible(false);

      } else {

        // ✅ SCROLL UP
        setVisible(true);
      }

      lastScroll = current;
    };

    container.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {

      container.removeEventListener(
        "scroll",
        handleScroll
      );
    };

  }, []);

  return (

    <div
      className={`fixed bottom-10 left-3 z-[999] transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-24 opacity-0"
      }`}
    >

      {/* MENU */}
      {open && (

        <div className="flex flex-col items-end gap-3 mb-4">

          {/* CHANNEL */}
          <button
            onClick={() => {

              setOpen(false);

              onOpenChannel();

            }}
            className="flex items-center gap-3 bg-[#202c33] text-white px-5 py-3 rounded-2xl shadow-xl"
          >

            <Megaphone size={22} />

            <span className="font-medium">
              Channel
            </span>

          </button>

          {/* COMMUNITY */}
          <button
            onClick={() => {

              setOpen(false);

              onOpenCommunity();

            }}
            className="flex items-center gap-3 bg-[#202c33] text-white px-5 py-3 rounded-2xl shadow-xl"
          >

            <Users size={22} />

            <span className="font-medium">
              Create Community
            </span>

          </button>

        </div>
      )}

      {/* FLOAT BUTTON */}
      <button
        onClick={() =>
          setOpen(prev => !prev)
        }
        className="w-12 h-12 rounded-full bg-[#00a884] shadow-2xl flex items-center justify-center text-white"
      >

        <Plus size={30} />

      </button>

    </div>
  );
}