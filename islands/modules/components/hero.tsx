import { motion } from "framer-motion";
import { IslandProps } from "@/modules/types";
import { cn } from "@/modules/lib/utils";

// Definisi Tipe Data Spesifik untuk Hero
type HeroData = {
    headline?: string;
    subheadline?: string;
    ctaText?: string;
    ctaLink?: string;
    align?: "left" | "center";
    bgVariant?: "glow" | "simple";
}

export default function Hero({ Data = {} }: IslandProps) {
    // Casting Data ke tipe HeroData agar aman
    const content = Data as HeroData;
    const alignClass = content.align === "left" ? "text-left items-start" : "text-center items-center";

    return (
        <div className="relative w-full min-h-[80vh] flex flex-col justify-center items-center overflow-hidden py-20">
            
            {/* 1. Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {content.bgVariant === "glow" && (
                    <>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-500/20 blur-[120px] rounded-full mix-blend-screen" />
                        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary-500/10 blur-[100px] rounded-full mix-blend-screen" />
                    </>
                )}
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
            </div>

            {/* 2. Content */}
            <div className={cn("relative z-10 container mx-auto px-6 flex flex-col gap-6 max-w-4xl", alignClass)}>
                
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]"
                >
                    {content.headline || "Welcome to Brainwave"}
                </motion.h1>

                {content.subheadline && (
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="text-lg md:text-xl text-netral-400 max-w-2xl leading-relaxed"
                    >
                        {content.subheadline}
                    </motion.p>
                )}

                {content.ctaText && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <a 
                            href={content.ctaLink || "#"}
                            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-500 transition-all hover:scale-105 shadow-lg shadow-primary-900/20"
                        >
                            {content.ctaText}
                        </a>
                    </motion.div>
                )}
            </div>
        </div>
    );
}