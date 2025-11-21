import { useState } from "react";

export default function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-2 text-3xl">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`cursor-pointer transition ${
            (hover || value) >= star ? "text-yellow-400" : "text-gray-300"
          }`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
