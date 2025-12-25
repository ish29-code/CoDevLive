import { useTheme } from "../context/ThemeContext";

export default function Loader() {
    const { theme } = useTheme();
    const isLight = theme === "light";

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{
                background: `linear-gradient(
          to bottom right,
          var(--gradient-start),
          var(--gradient-end)
        )`,
            }}
        >
            <div
                className="
          w-[100px] h-[100px]
          border-4
          border-[var(--accent)]
          border-t-transparent
          rounded-full
          animate-spin
        "
            />
        </div>
    );
}
