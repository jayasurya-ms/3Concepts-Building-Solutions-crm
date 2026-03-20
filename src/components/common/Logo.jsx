import React from "react";

const Logo = () => {
  return (
    <div>
      <svg
        width="300"
        height="80"
        viewBox="0 0 340 30"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1f7a57" />
            <stop offset="100%" stopColor="#4cd964" />
          </linearGradient>
        </defs>
        <circle cx="30" cy="30" r="28" fill="url(#logoGradient)" />
        <path
          d="M22 20h10a6 6 0 1 1 0 12h-6v8h-4V20zm4 4v4h6a2 2 0 1 0 0-4h-6z"
          fill="#ffffff"
        />
        <g fontFamily="Segoe UI, sans-serif">
          <text x="70" y="32" fontSize="20" fill="#1f7a57" fontWeight="bold">
            Pavanshree Plastic
          </text>
          <text x="70" y="50" fontSize="16" fill="#444">
            Industries
          </text>
        </g>
      </svg>
    </div>
  );
};

export default Logo;
