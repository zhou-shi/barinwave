// Definisikan x-ref apa saja yang ada di HTML Anda

import { screens } from "../utils/screen";

// Pastikan di HTML ada x-ref="content" dan x-ref="trigger"
interface DropdownRefs {
    trigger: HTMLButtonElement;
    content: HTMLElement;
}

export interface DropdownStore {
    isOpen: boolean;
    variant: 'default' | 'collapse' | 'responsive';
    toggle: () => void;
    close: () => void;
    open: () => void;
    collectItems: () => HTMLElement[];
    onKeydown: (event: KeyboardEvent) => void;
    $refs: DropdownRefs;
    $nextTick: (callback: () => void) => void;
}

export default function dropdown(variant: DropdownStore['variant'] = "default"): DropdownStore {
    return {
        isOpen: false,
        variant: variant,
        // Karena $refs disuntikkan oleh Alpine, kita tidak mendefinisikannya di sini.
        // TypeScript akan komplain, jadi kita akan gunakan 'as DropdownStore' di bawah.
        // Properti ini 'undefined' saat inisialisasi JS, tapi 'defined' saat Alpine running.
        $refs: {} as DropdownRefs,
        $nextTick: () => {},

        get isCollapse() {
            if (this.variant === 'collapse') return true;
            if (this.variant === 'default') return false;
     
            return !screens.md;
        },
    
        toggle() {
            this.isOpen = !this.isOpen;
        },

        close() {
            this.isOpen = false;
        },

        open() {
            this.isOpen = true;
            // Tunggu DOM berubah dari hidden -> visible
            this.$nextTick(() => {
                const items = this.collectItems();

                if (items.length > 0) {
                    items[0]?.focus();
                }
            });
        },

        collectItems() {
            if (!this.$refs.content) return [];

            const items = [
                ...this.$refs.content.querySelectorAll<HTMLElement>(
                    '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]')
            ];

            // Filter item yang tidak hidden (visibile)
            return items.filter((item) => item.offsetParent !== null);
        },

        onKeydown(event: KeyboardEvent) {
            if (!this.isOpen) return;

            const items = this.collectItems();
            const activeElement = document.activeElement as HTMLElement;
            const currentIndex = items.indexOf(activeElement);

            switch (event.key) {
                case "Escape":
                    event.preventDefault();
                    this.close();
                    this.$refs.trigger.focus();
                    break;
                case "ArrowDown":
                    event.preventDefault();
                    if (currentIndex === -1 || currentIndex === items.length - 1) {
                        items[0]?.focus();
                    } else {
                        items[currentIndex + 1]?.focus();
                    }
                    break;
                case "ArrowUp":
                    event.preventDefault();
                    if (currentIndex === -1 || currentIndex === 0) {
                        items[items.length - 1]?.focus();
                    } else {
                        items[currentIndex - 1]?.focus();
                    }
                    break;
                case "Home":
                    event.preventDefault();
                    items[0]?.focus();
                    break;
                case "End":
                    event.preventDefault();
                    items[items.length - 1]?.focus();
                    break;
            }
        }
    } as DropdownStore;
}