import * as LucideIcons from "lucide-react";


/**
 * Fungsi ini memastikan kita mendapatkan objek yang aman.
 * Jika input undefined/null, kembalikan default value.
 */
export const safeEntry = <T>(input: any, defaults: T): T => {
    if (!input) return defaults;
    
    // Merge input dengan default values (Shallow Merge)
    return { ...defaults, ...input };
};

/**
 * Validasi varian tombol agar tidak error class-name
 */
export const safeVariant = (variant: string | undefined, fallback: "primary" | "outline" = "primary"): string => {
    const allowed = ["primary", "secondary", "outline", "ghost", "link"];
    return allowed.includes(variant || "") ? variant! : fallback;
};

export const safeLucideIcon = (icon: string): LucideIcons.LucideIcon | undefined => {
    if (icon && icon in LucideIcons && typeof LucideIcons[icon as keyof typeof LucideIcons] === "function") {
        return LucideIcons[icon as keyof typeof LucideIcons] as LucideIcons.LucideIcon;
    }
    return undefined;
};