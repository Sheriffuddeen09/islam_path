export default function ConfirmSendModal({
  show,
  files,
  username,
  onCancel,
  onConfirm,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl p-6 w-80 text-center">

        <p className="mb-4 text-sm font-bold">
          Send {files.length} {files.length > 1 ? "files" : "file"} to{" "}
          <span className="text-green-400 font-semibold">
            {username}
          </span> ?
        </p>

        {/* FILE LIST */}
        <div className="max-h-40 overflow-y-auto text-xs text-left mb-4">
          {files.map((f, i) => (
            <div key={i} className="truncate border-b py-1">
              📄 {f.name}
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="text-red-400"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="text-green-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}