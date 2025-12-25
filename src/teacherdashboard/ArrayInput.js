import { useState, useEffect } from "react";

export default function ArrayInput({
  label,
  values = [],
  onChange = () => {},
  placeholder = "",
  disabled = false,
  autoGrow = false,
}) {
  const [localValues, setLocalValues] = useState(Array.isArray(values) ? values : []);

  // 🔹 Sync with prop changes
  useEffect(() => {
    setLocalValues(Array.isArray(values) ? values : []);
  }, [values]);

  const handleChange = (index, value) => {
    if (disabled) return;
    const updated = [...localValues];
    updated[index] = value;
    setLocalValues(updated);
    onChange(updated);
  };

  const handleAutoGrow = (e) => {
    if (!autoGrow) return;
    if (e.target.value.length < 70) return;
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const addField = () => !disabled && handleChange(localValues.length, "");
  const removeField = (index) =>
    !disabled &&
    handleChange(
      index,
      null // remove field at index
    );

  return (
    <div className={`space-y-2 ${disabled ? "opacity-50" : ""}`}>
      <label className="text-sm font-semibold">{label}</label>

      {localValues.map((val, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          {autoGrow ? (
            <textarea
              value={val || ""}
              rows={1}
              disabled={disabled}
              placeholder={placeholder}
              onInput={handleAutoGrow}
              onChange={(e) => handleChange(idx, e.target.value)}
              className="w-full border rounded px-3 py-2 resize-none overflow-hidden disabled:bg-gray-100"
            />
          ) : (
            <input
              value={val || ""}
              disabled={disabled}
              onChange={(e) => handleChange(idx, e.target.value)}
              placeholder={placeholder}
              className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
            />
          )}

          {!disabled && (
            <button
              type="button"
              onClick={() =>
                setLocalValues(localValues.filter((_, i) => i !== idx)) &&
                onChange(localValues.filter((_, i) => i !== idx))
              }
              className="text-red-600 font-bold mt-2"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {!disabled && (
        <button
          type="button"
          onClick={() => setLocalValues([...localValues, ""]) && onChange([...localValues, ""])}
          className="text-sm text-blue-600"
        >
          + Add
        </button>
      )}
    </div>
  );
}
