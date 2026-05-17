import { useEffect, useState } from "react";

import {
  X,
  Moon,
  Sun,
  Palette,
  Check,
  Loader2,
} from "lucide-react";

import api from "../Api/axios";

const primaryThemes = [
  {
    id: "white",
    color: "#FFFFFF",
  },
  {
    id: "black",
    color: "#0b141a",
  },
  {
    id: "gray",
    color: "#202c33",
  },
  {
    id: "blue",
    color: "#f5f5f5",
  },
  {
    id: "darkblue",
    color: "#17191c",
  },
  {
    id: "skyblue",
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
    id: "auto",
    color:
      "linear-gradient(135deg,#000,#fff)",
  },
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
    color: "#202c33",
  },
  {
    id: "blueText",
    color: "#3B82F6",
  },
  {
    id: "greenText",
    color: "#22C55E",
  },
  {
    id: "purpleText",
    color: "#A855F7",
  },
  {
    id: "orangeText",
    color: "#F97316",
  },
  {
    id: "pinkText",
    color: "#EC4899",
  },
];

export default function AppearanceModal({
  open,
  onClose,
}) {
  const [previewMode, setPreviewMode] =
    useState("light");

  const [previewTheme, setPreviewTheme] =
    useState("blue");

  const [
    previewTextColor,
    setPreviewTextColor,
  ] = useState("auto");

  // APPLY THEME
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
    let finalTextColor;

    if (textColorId === "auto") {

      finalTextColor =
        mode === "dark"
          ? "#FFFFFF"
          : "#000000";

    } else {

      const currentTextTheme =
        textThemes.find(
          t =>
            t.id ===
            textColorId
        );

      finalTextColor =
        currentTextTheme?.color ||
        "#000000";
    }

    document.documentElement.style.setProperty(
      "--text-color",
      finalTextColor
    );

    // BACKGROUND
    document.documentElement.style.setProperty(
      "--bg-color",
      mode === "dark"
        ? "#17191c"
        : "#ffffff"
    );

    // CARD
    document.documentElement.style.setProperty(
      "--primary-color",
      mode === "dark"
        ? "#171a1f"
        : "#f5f5f5"
    );
  };

  const [applyLoading, setApplyLoading] = useState(false)
  // LOAD THEME
  useEffect(() => {

  const loadTheme = async () => {

    try {

      const localMode = localStorage.getItem("theme_mode");
      const localColor = localStorage.getItem("theme_color");
      const localText = localStorage.getItem("text_color");

      if (localMode && localColor && localText) {

        setPreviewMode(localMode);
        setPreviewTheme(localColor);
        setPreviewTextColor(localText);

        applyTheme(localMode, localColor, localText);

        return;
      }

      const res = await api.get("/api/theme");

      const {
        theme_mode,
        theme_color,
        text_color,
      } = res.data;

      setPreviewMode(theme_mode || "light");
      setPreviewTheme(theme_color || "blue");
      setPreviewTextColor(text_color || "auto");

      applyTheme(
        theme_mode || "light",
        theme_color || "blue",
        text_color || "auto"
      );

    } catch (error) {
      console.log(error);
    }
  };

  loadTheme();

}, []);

  // APPLY BUTTON
  const handleApply = async () => {
  try {
    setApplyLoading(true);

    const payload = {
      theme_mode: previewMode,
      theme_color: previewTheme,
      text_color: previewTextColor,
    };

    await api.post("/api/theme/update", payload);

    // ✅ SAVE TO LOCAL STORAGE (IMPORTANT)
    localStorage.setItem("theme_mode", previewMode);
    localStorage.setItem("theme_color", previewTheme);
    localStorage.setItem("text_color", previewTextColor);

    applyTheme(previewMode, previewTheme, previewTextColor);

    onClose();

  } finally {
    setApplyLoading(false);
  }
};


  if (!open) return null;

  const activeTheme =
    primaryThemes.find(
      t => t.id === previewTheme
    );

  const activeTextColor =
    previewTextColor === "auto"
      ? previewMode === "dark"
        ? "#FFFFFF"
        : "#000000"
      : textThemes.find(
          t =>
            t.id ===
            previewTextColor
        )?.color;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

      <div
        className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ${
          previewMode === "dark"
            ? "bg-[#0b141a]"
            : "bg-gray-50"
        }`}
      >

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">

          <div>

            <h2 className={`text-xl mt-3 font-bold ${
              previewMode === "dark"
                ? "text-white"
                : "text-black"
            }`}>
              Appearance
            </h2>

            <p className={`text-sm mt-3 ${
              previewMode === "dark"
                ? "text-white"
                : "text-black"
            }`}>
              Customize your website
              theme
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center"
          >
            <X
              className={`${
                previewMode === "dark"
                  ? "text-white"
                  : "text-black"
              }`}
            />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-8 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400">

          {/* MODE */}
          <div>

            <div className="flex items-center gap-2 mb-4">

              <Palette
                size={20}
                className={`${
                  previewMode === "dark"
                    ? "text-white"
                    : "text-black"
                }`}
              />

              <h3 className={`font-semibold ${
                previewMode === "dark"
                  ? "text-white"
                  : "text-black"
              }`}>
                Theme Mode
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">

              {/* LIGHT */}
              <button
                onClick={() =>
                  setPreviewMode(
                    "light"
                  )
                }
                className={`rounded-2xl border-2 p-5 transition ${
                  previewMode === "light"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
              >

                <div className="flex flex-col items-center gap-3">

                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <Sun size={28} />
                  </div>

                  <p className={`font-medium ${
                    previewMode === "dark"
                      ? "text-white"
                      : "text-black"
                  }`}>
                    Light
                  </p>
                </div>
              </button>

              {/* DARK */}
              <button
                onClick={() =>
                  setPreviewMode(
                    "dark"
                  )
                }
                className={`rounded-2xl border p-5 transition ${
                  previewMode === "dark"
                  ? "border-green-500 bg-gray-900"
                  : "border-gray-200"
                }`}
              >

                <div className="flex flex-col items-center gap-3">

                  <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center">
                    <Moon size={28} />
                  </div>

                  <p className={`font-medium ${
                    previewMode === "dark"
                      ? "text-white"
                      : "text-black"
                  }`}>
                    Dark
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* ACCENT COLOR */}
          <div>

            <h3 className={`font-semibold mb-4 ${
              previewMode === "dark"
                ? "text-white"
                : "text-black"
            }`}>
              Accent Color
            </h3>

            <div className="grid grid-cols-5 gap-4">

              {primaryThemes.map(
                item => (
                  <button
                    key={item.id}
                    onClick={() =>
                      setPreviewTheme(
                        item.id
                      )
                    }
                    className="relative w-14 h-14 rounded-2xl border border-white flex items-center justify-center"
                    style={{
                      background:
                        item.color,
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
                )
              )}
            </div>
          </div>

          {/* TEXT COLOR */}
          <div>

            <h3 className={`font-semibold mb-4 ${
              previewMode === "dark"
                ? "text-white"
                : "text-black"
            }`}>
              Text Color
            </h3>

            <div className="grid grid-cols-5 gap-4">

              {textThemes.map(
                item => (
                  <button
                    key={item.id}
                    onClick={() =>
                      setPreviewTextColor(
                        item.id
                      )
                    }
                    className="relative w-14 h-14 rounded-2xl border border-gray-300 flex items-center justify-center"
                    style={{
                      background:
                        item.color,
                    }}
                  >

                    {previewTextColor ===
                      item.id && (
                      <Check
                        size={22}
                        className={`${
                          item.id ===
                            "white" ||
                          item.id ===
                            "auto"
                            ? "text-black"
                            : "text-white"
                        }`}
                      />
                    )}
                  </button>
                )
              )}
            </div>
          </div>

          {/* PREVIEW */}
          <div>

            <h3 className={`font-semibold mb-4 ${
              previewMode === "dark"
                ? "text-white"
                : "text-black"
            }`}>
              Live Preview
            </h3>

            <div className={`rounded-3xl overflow-hidden border ${
              previewMode === "dark"
                ? "bg-[#0b141a] border-white/10"
                : "bg-gray-50 border-gray-200"
            }`}>

              {/* HEADER */}
              <div
                className={`p-4 font-semibold
                ${previewMode === "dark"
                ? "text-white bg-black"
                : "text-black bg-white"
            }`}
              >
                Website Header
              </div>

              {/* BODY */}
              <div className="p-4 space-y-3">

                <div
                  className={`rounded-2xl px-4 py-3 w-fit shadow ${
                    previewMode ===
                    "dark"
                      ? "bg-[#202c33]"
                      : "bg-white"
                  }`}
                  style={{
                    color:
                      activeTextColor,
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
                      activeTextColor,
                  }}
                >
                  Theme Applied
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-gray-200 dark:border-white/10 flex gap-3">

          <button
            onClick={onClose}
            className={`flex-1 py-4 rounded-2xl border border-gray-300 font-semibold ${
              previewMode === "dark"
                ? "text-white"
                : "text-black"
            }`}
          >
            Cancel
          </button>

          <button
            onClick={handleApply}
            className={`flex-1 py-4 rounded-2xl font-semibold ${
              previewMode === "dark"
                ? "text-white bg-black"
                : "text-black bg-white"
            }`}
          >{ applyLoading
            ? 
            <div className="inline-flex gap-2 items-center ">
              <Loader2 className="animate-spin" size={18} />
              Applying
            </div>
            : "Apply Change"
            
            }
          </button>
        </div>
      </div>
    </div>
  );
}