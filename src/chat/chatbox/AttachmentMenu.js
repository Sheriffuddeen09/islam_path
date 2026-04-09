import { useEffect, useState } from "react";

export default function AttachmentMenu({ show, onClose, onPick }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      // delay unmount for animation
      setTimeout(() => setVisible(false), 200);
    }
  }, [show]);

  if (!visible) return null;

  const Item = ({ icon, label, onClick }) => (
    <div
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 cursor-pointer group"
    >
      <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center text-2xl 
        transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
        {icon}
      </div>
      <span className="text-xs text-white">{label}</span>
    </div>
  );

  return (
    <div
      className={`absolute bottom-20 left-0 w-full flex justify-center z-50 transition-all duration-200 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
    >
      <div className="bg-black/90 p-5 rounded-2xl grid grid-cols-3 gap-6 text-white shadow-xl backdrop-blur-md">

        <Item
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 
                1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 
                1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 
                2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
            </svg>
          }
          label="Image"
          onClick={() => {
            onPick("image");
            onClose();
          }}
        />

        <Item
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>

          }
          label="Video"
          onClick={() => {
            onPick("video");
            onClose();
          }}
        />

        <Item
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>

          }
          label="Document"
          onClick={() => {
            onPick("document");
            onClose();
          }}
        />

        <Item
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>

          }
          label="Audio"
          onClick={() => {
            onPick("audio");
            onClose();
          }}
        />

      </div>
    </div>
  );
}