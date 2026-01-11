function Logo({ size = 'default' }) {
    const sizes = {
        small: { width: 180, height: 40 },
        default: { width: 200, height: 44 },
        large: { width: 240, height: 52 }
    };

    const { width, height } = sizes[size] || sizes.default;

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 180 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Bin Hamoodah Properties"
        >
            {/* Three red diamonds arranged as pyramid */}
            <g fill="#C41E3A">
                {/* Top diamond */}
                <rect x="12" y="2" width="10" height="10" transform="rotate(45 17 7)" />
                {/* Bottom left diamond */}
                <rect x="3" y="13" width="10" height="10" transform="rotate(45 8 18)" />
                {/* Bottom right diamond */}
                <rect x="21" y="13" width="10" height="10" transform="rotate(45 26 18)" />
            </g>
            {/* Company name - single color */}
            <text
                x="40"
                y="24"
                fill="#e2e8f0"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="14"
                fontWeight="600"
            >
                Bin Hamoodah Properties
            </text>
        </svg>
    );
}

export default Logo;
