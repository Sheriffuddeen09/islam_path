import { useEffect, useState } from "react";
import {
  X,
  Moon,
  Sun,
  Palette,
  Check,
} from "lucide-react";

const primaryThemes = [
  {
    id: "white",
    color: "#FFFFFF",
  },
  {
    id: "black",
    color: "#000000",
  },
  {
    id: "gray",
    color: "#6B7280",
  },
  {
    id: "blue",
    color: "#3B82F6",
  },
  {
    id: "green",
    color: "#22C55E",
  },
  {
    id: "purple",
    color: "#A855F7",
  },
  {
    id: "orange",
    color: "#F97316",
  },
  {
    id: "pink",
    color: "#EC4899",
  },
];

const textThemes = [
  {
    id: "white",
    color: "#FFFFFF",
  },
  {
    id: "black",
    color: "#000000",
  },
  {
    id: "gray",
    color: "#6B7280",
  },
  {
    id: "blueText",
    color: "#3B82F6",
  },
  {
    id: "greenText",
    color: "#22C55E",
  },
];
export default function AppearanceModal({
  open,
  onClose,
}) {
    const [savedMode, setSavedMode] =
  useState("light");

const [savedTheme, setSavedTheme] =
  useState("blue");

const [savedTextColor, setSavedTextColor] =
  useState("white");

const [previewMode, setPreviewMode] =
  useState("light");

const [previewTheme, setPreviewTheme] =
  useState("blue");

const [previewTextColor, setPreviewTextColor] =
  useState("white");


  const applyTheme = (
  mode,
  themeId,
  textColorId
) => {

  // DARK MODE
  if (mode === "dark") {
    document.documentElement.classList.add(
      "dark"
    );
  } else {
    document.documentElement.classList.remove(
      "dark"
    );
  }

  // PRIMARY COLOR
  const currentTheme =
    primaryThemes.find(
      t => t.id === themeId
    );

  if (currentTheme) {

    document.documentElement.style.setProperty(
      "--primary-color",
      currentTheme.color
    );
  }

  // TEXT COLOR
  const currentText =
    textThemes.find(
      t => t.id === textColorId
    );

  if (currentText) {

    document.documentElement.style.setProperty(
      "--text-color",
      currentText.color
    );
  }
};

  useEffect(() => {

    const mode =
      localStorage.getItem("theme_mode") ||
      "light";

    const theme =
      localStorage.getItem("theme_color") ||
      "blue";

    const textColor =
      localStorage.getItem("text_color") ||
      "white";

    setSavedMode(mode);
    setSavedTheme(theme);
    setSavedTextColor(textColor);

    setPreviewMode(mode);
    setPreviewTheme(theme);
    setPreviewTextColor(textColor);

    applyTheme(
      mode,
      theme,
      textColor
    );

  }, []);
  

const handleApply = () => {

  setSavedMode(previewMode);

  setSavedTheme(previewTheme);

  setSavedTextColor(
    previewTextColor
  );

  localStorage.setItem(
    "theme_mode",
    previewMode
  );

  localStorage.setItem(
    "theme_color",
    previewTheme
  );

  localStorage.setItem(
    "text_color",
    previewTextColor
  );

  applyTheme(
    previewMode,
    previewTheme,
    previewTextColor
  );

  onClose();
};

  // CLOSE WITHOUT APPLYING
 const handleClose = () => {

  applyTheme(
    savedMode,
    savedTheme,
    savedTextColor
  );

  onClose();
};

  if (!open) return null;

const activeTheme =
  primaryThemes.find(
    t => t.id === previewTheme
  );

const activeTextTheme =
  textThemes.find(
    t =>
      t.id ===
      previewTextColor
  );

  return (
  <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

    <div className="w-full max-w-md rounded-3xl  overflow-hidden shadow-2xl bg-white dark:bg-[#111b21]">

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">

        <div>
          <h2 className="text-xl mt-3 font-bold text-gray-900 dark:text-white">
            Appearance
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Customize your website theme
          </p>
        </div>

        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center"
        >
          <X className="text-gray-700 dark:text-white" />
        </button>
      </div>

      {/* SCROLLABLE BODY */}
      <div className="p-5 space-y-8 max-h-[65vh] overflow-y-auto ">

        {/* THEME MODE */}
        <div>

          <div className="flex items-center gap-2 mb-4">

            <Palette
              size={20}
              className="text-gray-500"
            />

            <h3 className="font-semibold text-gray-900 dark:text-white">
              Theme Mode
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">

            {/* LIGHT */}
            <button
              onClick={() =>
                setPreviewMode("light")
              }
              className={`rounded-2xl border p-5 transition ${
                previewMode === "light"
                  ? "border-[var(--primary-color)]"
                  : "border-gray-200 dark:border-white/10"
              }`}
            >

              <div className="flex flex-col items-center gap-3">

                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                  <Sun size={28} />
                </div>

                <p className="font-medium text-gray-900">
                  Light
                </p>
              </div>
            </button>

            {/* DARK */}
            <button
              onClick={() =>
                setPreviewMode("dark")
              }
              className={`rounded-2xl border p-5 transition ${
                previewMode === "dark"
                  ? "border-[var(--primary-color)]"
                  : "border-gray-200 dark:border-white/10"
              }`}
            >

              <div className="flex flex-col items-center gap-3">

                <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center">
                  <Moon size={28} />
                </div>

                <p className="font-medium text-gray-900 dark:text-white">
                  Dark
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ACCENT COLOR */}
        <div>

          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Accent Color
          </h3>

          <div className="grid grid-cols-5 gap-4">

            {primaryThemes.map(item => (

              <button
                key={item.id}
                onClick={() =>
                  setPreviewTheme(item.id)
                }
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition"
                style={{
                  background: item.color,
                }}
              >

                {previewTheme ===
                  item.id && (

                  <Check
                    size={22}
                    className="text-white"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* TEXT COLOR */}
        <div>

          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Text Color
          </h3>

          <div className="grid grid-cols-5 gap-4">

            {textThemes.map(item => (

              <button
                key={item.id}
                onClick={() =>
                  setPreviewTextColor(
                    item.id
                  )
                }
                className="relative w-14 h-14 rounded-2xl border border-gray-300 dark:border-white/10 flex items-center justify-center"
                style={{
                  background: item.color,
                }}
              >

                {previewTextColor ===
                  item.id && (

                  <Check
                    size={22}
                    className={`${
                      item.color === "#FFFFFF"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* LIVE PREVIEW */}
        <div>

          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Live Preview
          </h3>

          <div
            className={`rounded-3xl overflow-hidden border ${
              previewMode === "dark"
                ? "bg-[#0b141a] border-white/10"
                : "bg-gray-50 border-gray-200"
            }`}
          >

            {/* HEADER */}
            <div
              className="p-4 font-semibold"
              style={{
                background:
                  activeTheme?.color,

                color:
                  activeTextTheme?.color,
              }}
            >
              Website Header
            </div>

            {/* BODY */}
            <div className="p-4 space-y-3">

              <div
                className={`rounded-2xl px-4 py-3 w-fit shadow ${
                  previewMode === "dark"
                    ? "bg-[#202c33]"
                    : "bg-white"
                }`}
                style={{
                    color:
                      activeTextTheme?.color,
                  }}
              >
                Hello 👋
              </div>

              <div
                className="rounded-2xl px-4 py-3 w-fit ml-auto"
                style={{
                  background:
                    activeTheme?.color,

                  color:
                    activeTextTheme?.color,
                }}
              >
                Theme Applied
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-5 border-t  border-gray-200 dark:border-white/10 flex gap-3">

        <button
          onClick={handleClose}
          className="flex-1 py-4 rounded-2xl border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white font-semibold"
        >
          Cancel
        </button>

        <button
          onClick={handleApply}
          className="flex-1 py-4 rounded-2xl font-semibold"
          style={{
              background:
                activeTheme?.color,

              color:
                activeTextTheme?.color,
            }}
        >
          Apply
        </button>
      </div>
    </div>
  </div>
);
}