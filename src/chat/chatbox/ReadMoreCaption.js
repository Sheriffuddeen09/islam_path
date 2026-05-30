import React, { useState } from "react";

export default function ReadMoreCaption({
  text,
  maxLength = 120,
}) {
  const [expanded, setExpanded] =
    useState(false);

  if (!text) return null;

  const shouldTrim =
    text.length > maxLength;

  const displayText =
    expanded || !shouldTrim
      ? text
      : text.slice(0, maxLength) + "...";

  return (
    <div
      className="
        text-white
        text-center
        text-[13px]
        leading-relaxed
        font-medium
      "
    >
      <span>{displayText}</span>

      {shouldTrim && (
        <button
          onClick={() =>
            setExpanded(!expanded)
          }
          className="
            ml-2
            text-white
            font-bold
          "
        >
          {expanded
            ? "Show less"
            : "Read more"}
        </button>
      )}
    </div>
  );
}