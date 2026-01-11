function Logo({ size = 'default' }) {
    const sizes = {
        small: { width: 200, height: 40 },
        default: { width: 220, height: 44 },
        large: { width: 260, height: 52 }
    };

    const { width, height } = sizes[size] || sizes.default;

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Bin Hamoodah Properties"
        >
            {/* Three red diamonds arranged as pyramid */}
            <g fill="#C41E3A">
                {/* Top diamond */}
                <rect x="12" y="2" width="12" height="12" transform="rotate(45 18 8)" />
                {/* Bottom left diamond */}
                <rect x="2" y="14" width="12" height="12" transform="rotate(45 8 20)" />
                {/* Bottom right diamond */}
                <rect x="22" y="14" width="12" height="12" transform="rotate(45 28 20)" />
            </g>
            {/* Company name - single color, no LLC */}
            <text
                x="45"
                y="24"
                fill="#e2e8f0"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="16"
                fontWeight="600"
            >
                Bin Hamoodah Properties
            </text>
        </svg>
    );
}

export default Logo;
