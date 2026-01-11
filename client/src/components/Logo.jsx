function Logo({ size = 'default' }) {
    const sizes = {
        small: { width: 140, height: 40 },
        default: { width: 180, height: 50 },
        large: { width: 240, height: 65 }
    };

    const { width, height } = sizes[size] || sizes.default;

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 240 65"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Bin Hamoodah Properties L.L.C."
        >
            {/* Three Red Diamonds - Inverted Triangle/Pyramid */}
            <g transform="translate(0, 8)">
                {/* Top diamond */}
                <polygon
                    points="22,0 32,12 22,24 12,12"
                    fill="#C41E3A"
                />
                {/* Bottom left diamond */}
                <polygon
                    points="10,20 20,32 10,44 0,32"
                    fill="#C41E3A"
                />
                {/* Bottom right diamond */}
                <polygon
                    points="34,20 44,32 34,44 24,32"
                    fill="#C41E3A"
                />
            </g>

            {/* Arabic Text - بن حموده للعقارات ذ.م.م */}
            <text
                x="55"
                y="22"
                fill="#1a365d"
                fontFamily="'Segoe UI', 'Arial', sans-serif"
                fontSize="11"
                fontWeight="600"
                direction="rtl"
            >
                بن حموده للعقارات ذ.م.م
            </text>

            {/* English Text - Bin Hamoodah Properties L.L.C. */}
            <text
                x="55"
                y="38"
                fill="#1a365d"
                fontFamily="'Segoe UI', 'Arial', sans-serif"
                fontSize="13"
                fontWeight="700"
            >
                Bin Hamoodah Properties
            </text>
            <text
                x="55"
                y="52"
                fill="#1a365d"
                fontFamily="'Segoe UI', 'Arial', sans-serif"
                fontSize="10"
                fontWeight="500"
            >
                L.L.C.
            </text>

            {/* Subtle underline */}
            <line
                x1="55"
                y1="56"
                x2="180"
                y2="56"
                stroke="#C41E3A"
                strokeWidth="1"
                opacity="0.5"
            />
        </svg>
    );
}

export default Logo;
