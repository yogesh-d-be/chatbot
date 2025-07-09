module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      lineHeight: {
        height: '3.625', // This should be available by default
      },
      colors: {
        primaryColor: "#861B47",
        SecondaryColor: "rgb(243 244 246)",
        colorOne: "#c4b0fa",
        colorTwo: "#f5cb8d",
        colorThree: "#ececec",
        colorFour: "#31686e",
        colorFive: "#21a9b7",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        sany: ["Inter", "sans-serif"],
        poppins: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        title: ['18px', { fontWeight: 'bold' }],
        subtitle: ['14px', { fontWeight: 'normal' }],
        date: ['13px', { fontWeight: 'normal' }],
        heading1: ['30px'],
        content: ['15px'],
      },
      keyframes: {
        typing: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        blink: {
          "50%": { borderColor: "transparent" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scrollLeft: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        zoomInOut: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
      },
      animation: {
        typing: "typing 4s steps(12) forwards", // Adjust duration and steps based on character count
        blink: "blink 0.7s step-end ",
      
        slideUp: "slideUp 1s ease-out",
        wave: "wave 5s infinite",
        "scroll-left": "scrollLeft 18s linear infinite",
        "zoom-in-out": "zoomInOut 1.5s infinite",
      },
    },
  },
  plugins: [],
};
