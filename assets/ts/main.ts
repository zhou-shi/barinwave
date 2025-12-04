import Alpine from "alpinejs";
import dropdown from "./components/dropdown";
import themeToggle from "./components/theme-toggle";


Alpine.data('themeToggle', themeToggle);
Alpine.data('dropdown', dropdown);

declare global {
    interface Window { Alpine: typeof Alpine; }
}

window.Alpine = Alpine;
Alpine.start();