import React from "react";
import { BadgeCheck } from "lucide-react";

export default function UpgradeBadge({
  upgrade,
  size = 18,
}) {
  if (!upgrade || upgrade.status !== "approved") {
    return null;
  }

  const labels = {
    author: "Author",
    marketer: "Marketer",
    question_page: "Question Page",
  };

  return (
    <span
      title={`Verified ${labels[upgrade.profile_type] || "Upgraded Profile"}`}
      className="inline-flex items-center gap-1 text-green-600"
    >
      <BadgeCheck
        size={size}
        className="fill-green-100 text-green-600"
      />
    </span>
  );
}

