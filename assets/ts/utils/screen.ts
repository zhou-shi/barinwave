import Alpine from 'alpinejs';

// Objek Reaktif (Penyimpanan Data)
export const screens = Alpine.reactive({
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
    current: 'sm'
});

// Logic Listener (Hanya ditulis sekali di sini)
const initBreakpoints = () => {
    const sm = 640; 
    const md = 768;
    const lg = 1024;
    const xl = 1280;
    const xxl = 1536;
    
    const queries:Record<string, string> = {
        sm:  `(min-width: ${sm}px)`,
        md:  `(min-width: ${md}px)`,
        lg:  `(min-width: ${lg}px)`,
        xl:  `(min-width: ${xl}px)`,
        '2xl': `(min-width: ${xxl}px)`
    };

    Object.entries(queries).forEach(([key, value]) => {
        const query = window.matchMedia(value);

        const update = (matches: boolean) => {
            // @ts-ignore
            screens[key] = matches; // Gunakan variable screenStore
            if (matches) {
                screens.current = key;
            }
        };

        update(query.matches);
        query.addEventListener('change', (e) => update(e.matches));
    });
};

// Export plugin untuk didaftarkan di Main.ts
export default function ScreenPlugin() {
    initBreakpoints();
    
    // Mendaftarkan $screen sebagai Magic Property
    // Sehingga bisa dipanggil di manapun dengan $screen.md
    Alpine.magic('screen', () => screens);
}