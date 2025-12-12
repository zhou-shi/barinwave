import Alpine from "alpinejs";
import dropdown from "./components/dropdown";
import themeToggle from "./components/theme-toggle";
import ScreenPlugin from "./utils/screen";
import { navigation } from "./components/navigation";

ScreenPlugin();

Alpine.data('themeToggle', themeToggle);
Alpine.data('dropdown', dropdown);
Alpine.data('navigation', navigation);

declare global {
    interface Window { Alpine: typeof Alpine; }
}

window.Alpine = Alpine;
Alpine.start();