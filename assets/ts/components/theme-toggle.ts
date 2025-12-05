export interface ThemeToggleStore {
    isDark: boolean;
    init: () => void;
    toggle: () => void;
    applyTheme: () => void;
}

export default function themeToggle(): ThemeToggleStore {
    return {
        isDark: false,

        init() {
            if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                this.isDark = true;
            } else {
                this.isDark = false;
            }

            this.applyTheme();
        },

        toggle() {
            this.isDark = !this.isDark;
            localStorage.theme = this.isDark ? "dark" : "light";
            this.applyTheme();
        },

        applyTheme() {
            if (this.isDark) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }
    };
}