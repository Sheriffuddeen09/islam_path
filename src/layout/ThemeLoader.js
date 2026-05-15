import { useEffect } from "react";
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

export default function ThemeLoader() {

  const applyTheme = (
    mode,
    themeId,
    textColorId
  ) => {

    // MODE
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

    let finalTextColor =
      "#000000";

    if (
      textColorId === "auto"
    ) {

      finalTextColor =
        mode === "dark"
          ? "#FFFFFF"
          : "#000000";

    } else if (
      currentText
    ) {

      finalTextColor =
        currentText.color;
    }

    document.documentElement.style.setProperty(
      "--text-color",
      finalTextColor
    );

    // BG COLOR
    document.documentElement.style.setProperty(
      "--bg-color",
      mode === "dark"
        ? "#17191c"
        : "#ffffff"
    );

    // CARD COLOR
    document.documentElement.style.setProperty(
      "--card-color",
      mode === "dark"
        ? "#f5f5f5"
        : " #17191c"
    );
  };

  useEffect(() => {

    const loadTheme =
      async () => {

        try {

          // FETCH USER
          const res =
            await api.get(
              "/api/theme"
            );

          const user =
            res.data;

          // GET FROM DATABASE
          const mode =
            user.theme_mode ||
            "light";

          const theme =
            user.theme_color ||
            "blue";

          const textColor =
            user.text_color ||
            "auto";

          // APPLY
          applyTheme(
            mode,
            theme,
            textColor
          );

        } catch (error) {

          console.log(error);
        }
      };

    loadTheme();

  }, []);

  return null;
}