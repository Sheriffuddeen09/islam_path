import { Link } from "react-router-dom";

export function RenderMention(text = "") {
  const regex = /@([\w\s]+)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // matched username
    if (index % 2 === 1) {
      const username = part.trim();

      return (
        <Link
          key={index}
          to={`/profile/${username}`}
          className="text-blue-600 font-semibold hover:underline"
        >
          @{username}
        </Link>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

// import { RenderMention } from "./RenderMention";

// <p className="text-sm text-gray-900 whitespace-pre-line">
//   {RenderMention(comment.body)}
// </p>
