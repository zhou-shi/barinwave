interface NavigationRefs {
    openNavigation: boolean;
    currentHash: string;
    toggleNavigation: () => void;
}

export function navigation(): NavigationRefs {
    return {
        openNavigation: false,
        currentHash: window.location.hash || '',
        toggleNavigation() {
            this.openNavigation = !this.openNavigation;
        }
    };
}