import MediaGrid from "./MediaGrid";

export default function MediaMessage({ msg, setPreview }) {
  if (!msg.type || (msg.type !== "image" && msg.type !== "video")) return null;

  return (
    <div className="max-w-xs">
      <MediaGrid msg={msg} setPreview={setPreview} />

      {msg.message && (
        <p className="text-sm mt-1 break-words">{msg.message}</p>
      )}
    </div>
  );
}