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
  onOpenChannel,
  setShowCommunityModal

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
      className={`relative transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-24 opacity-0"
      }`}
    >

      {/* MENU */}
      {open && (

        <div className="-translate-y-20 flex flex-col items-end gap-3 mb-4">

          {/* CHANNEL */}
          <button
            onClick={() => {

              setOpen(false);

              onOpenChannel();

            }}
            className="flex items-center gap-3 bg-[#202c33] text-white px-5 py-3 rounded-2xl shadow-xl"
          >

            <Megaphone size={17} />

            <span className="font-medium text-sm">
              Channel
            </span>

          </button>

          <button
            onClick={() => {

              setOpen(false);

              setShowCommunityModal(true);

            }}
            className="flex items-center gap-3 bg-[#202c33] text-white px-5 py-3 rounded-2xl shadow-xl"
          >

            <Users size={17} />

            <span className="font-medium text-sm">
              Create Channel
            </span>

          </button>

        </div>
      )}

      {/* FLOAT BUTTON */}
      <button
        onClick={() =>
          setOpen(prev => !prev)
        }
        className=" absolute bottom-10 right-3 w-12 h-12 rounded-full bg-[#00a884] shadow-2xl flex items-center justify-center text-white"
      >

        <Plus size={35} />

      </button>

    </div>
  );
}