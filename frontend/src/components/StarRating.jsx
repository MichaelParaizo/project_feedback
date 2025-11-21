import { useState } from "react";

export default function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(null);

  // Renderiza cada estrela (1 a 5)
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex gap-1">
      {stars.map((star) => {
        const isFilled = hovered
          ? star <= hovered
          : star <= value;

        return (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isFilled ? "#facc15" : "none"}      // amarelo lindo
            stroke={isFilled ? "#eab308" : "#9ca3af"} // contorno da estrela
            strokeWidth="2"
            className="w-7 h-7 cursor-pointer transition-all"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange(star)}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.014 
                 6.187a1 1 0 00.95.69h6.462c.969 0 
                 1.371 1.24.588 1.81l-5.232 
                 3.801a1 1 0 00-.364 1.118l2.014 
                 6.186c.3.922-.755 1.688-1.54 
                 1.118l-5.232-3.8a1 1 0 
                 00-1.175 0l-5.233 3.8c-.784.57-1.838-.196-1.539-1.118l2.014-6.186a1 
                 1 0 00-.364-1.118L2.075 11.61c-.783-.57-.38-1.81.588-1.81h6.462a1 
                 1 0 00.95-.69l2.014-6.187z"
            />
          </svg>
        );
      })}
    </div>
  );
}
