import * as React from "react"
// bouger dans le dossier components/widget/icons
//TODO rename file snake_case
const MailIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={16}
        height={16}
        fill="none"
        {...props}
    >
        <path
            fill="#FF9ABF"
            fillRule="evenodd"
            d="M4.64 1.264c0-.553.547-.948 1.087-.786l9.24 2.783a.824.824 0 0 1 .593.785v7.734c0 .553-.547.948-1.087.785l-9.24-2.782a.824.824 0 0 1-.593-.786V1.264Z"
            clipRule="evenodd"
            opacity={0.5}
        />
        <path
            fill="#F789B2"
            fillRule="evenodd"
            d="M2.54 2.576c0-.553.547-.948 1.087-.785l9.24 2.782a.824.824 0 0 1 .593.786v7.733c0 .553-.547.948-1.087.786l-9.24-2.783a.824.824 0 0 1-.593-.785V2.576Z"
            clipRule="evenodd"
            opacity={0.8}
        />
        <path
            fill="#FF5B97"
            fillRule="evenodd"
            d="M.44 4.221c0-.553.547-.948 1.087-.786l9.24 2.783a.824.824 0 0 1 .593.785v7.733c0 .554-.546.949-1.087.786l-9.24-2.782a.824.824 0 0 1-.593-.786V4.221Z"
            clipRule="evenodd"
        />
        <mask
            id="a"
            width={12}
            height={13}
            x={0}
            y={3}
            maskUnits="userSpaceOnUse"
            style={{
                maskType: "luminance",
            }}
        >
            <path
                fill="#fff"
                fillRule="evenodd"
                d="M.44 4.221c0-.553.547-.948 1.087-.786l9.24 2.783a.824.824 0 0 1 .593.785v7.733c0 .554-.546.949-1.087.786l-9.24-2.782a.824.824 0 0 1-.593-.786V4.221Z"
                clipRule="evenodd"
            />
        </mask>
        <g mask="url(#a)">
            <path
                fill="#F2357A"
                fillRule="evenodd"
                d="m.44 2.828 10.92 3.288-5.49 4.787a.85.85 0 0 1-1.306-.237L.44 2.828Z"
                clipRule="evenodd"
                style={{
                    mixBlendMode: "multiply",
                }}
            />
        </g>
    </svg>
)
export default MailIcon
