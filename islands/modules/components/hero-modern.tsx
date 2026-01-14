import { ComplexTitle, ConfigIsland, IslandProps } from "@/modules/types";
import { cn } from "@/modules/lib/utils";
import { Button, buttonVariants } from "@/modules/ui/shadcn/button"; // Pastikan path ini benar/sesuaikan
import { ErrorBoundary } from "@/modules/lib/error-boundry"; // Sesuaikan path
import { lazy, Suspense } from "preact/compat";
import { type VariantProps } from "class-variance-authority"
import { safeEntry } from "../lib/safe";
import { ANIM, MotionDiv, MotionH1, MotionP } from "../lib/motion";

// Lazy load Spline agar ringan
const Scene = lazy(() => import("@/modules/ui/spline/scene"));

const DEFAULT_PARAMS: HeroModernDataConfig =  {
    badge: "✨ Modern Badge By BRAINWAVE ✨",
    title: {
        start: "Welcome to",
        gradient: "Brainwave",
        end: "Theme"
    },
    description: "This is a modern hero component with 3D Spline integration, built using Preact and Framer Motion.",
    buttons: [
        {
            label: "Get Started",
            url: "#get-started",
            variant: "default"
        },
        {
            label: "Learn More",
            url: "#learn-more",
            variant: "outline"
        }
    ],
    splineUrl: "https://prod.spline.design/XzWmp-uI3N9d662r/scene.splinecode",
    showGlow: true
};

type HeroButtonConfig = {
    label: string;
    url: string;
} & VariantProps<typeof buttonVariants>;

type HeroModernDataConfig = {
    badge?: string;
    title?: ComplexTitle;
    description?: string;
    buttons?: HeroButtonConfig[];
    splineUrl?: string; // Input URL Spline dari YAML
    showGlow?: boolean;
}

export default function HeroModern({ Params = {} }: IslandProps) {
    const config = safeEntry<HeroModernDataConfig>(Params || {}, DEFAULT_PARAMS);

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center bg-[#0B0E14] overflow-hidden pt-20">
            
            {/* 1. Background Glow Optional */}
            {config.showGlow && (
                <MotionDiv
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-600/20 blur-[120px] rounded-full pointer-events-none" 
                />
            )}

            <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* 2. Left Content (Text) */}
                <MotionDiv 
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.3 }} // once: false agar animasi ulang saat scroll balik
                    variants={ANIM.container}
                    className="text-center lg:text-left"
                >
                    {config.badge && (
                        <MotionDiv variants={ANIM.slideRight} className="inline-block px-4 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-400 text-sm font-medium mb-6">
                            {config.badge}
                        </MotionDiv>
                    )}

                    <MotionH1 variants={ANIM.slideRight} className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight mb-6">
                        {config.title?.start} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">{config.title?.gradient}</span>
                        {config.title?.end && <><br/> <span className="text-white">{config.title?.end}</span></>}
                    </MotionH1>

                    <MotionP variants={ANIM.slideRight} className="text-lg text-netral-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                        {config.description}
                    </MotionP>

                    <MotionDiv variants={ANIM.slideUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        { config.buttons?.map((btn, idx) => (
                            <Button 
                                key={idx}
                                asChild // Jika pakai Radix/Shadcn untuk render sebagai <a>
                                variant={btn.variant === "outline" ? "outline" : "default"}
                                className={cn(
                                    "rounded-full transition-all hover:scale-105 active:scale-95",
                                    btn.variant !== "outline" 
                                        ? "bg-gradient-to-r from-primary-600 to-secondary-600 border-0 hover:shadow-[0_0_20px_rgba(var(--color-primary),0.5)]" 
                                        : "border-netral-700 text-white hover:bg-netral-800"
                                )}
                            >
                                <a href={btn.url}>{btn.label}</a>
                            </Button>
                        ))}
                    </MotionDiv>
                </MotionDiv>

                {/* 3. Right Content (3D Spline) */}
                {config.splineUrl && (
                    <div className="relative hidden lg:block h-[600px] w-full">
                         <MotionDiv
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: false }}
                            variants={ANIM.popIn}
                            className="absolute inset-0 bg-gradient-to-tr from-primary-900/10 to-transparent rounded-3xl border border-white/5 backdrop-blur-[2px] overflow-hidden shadow-2xl"
                        >
                             <ErrorBoundary fallback={<div className="text-white p-10">Error loading 3D</div>}>
                                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white/50">Loading 3D...</div>}>
                                    <Scene 
                                        sceneUrl={config.splineUrl}
                                        className="w-full h-full cursor-grab active:cursor-grabbing" 
                                    />
                                </Suspense>
                            </ErrorBoundary>

                            {/* Fake Floating UI (Bisa dibuat config juga kalau mau) */}
                            <MotionDiv 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1, duration: 0.8 }}
                                className="absolute bottom-6 left-6 z-10 flex flex-col gap-2 pointer-events-none"
                            >
                                <div className="flex gap-2 items-center bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 w-fit">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                                    <span className="text-xs text-green-500 font-mono font-bold tracking-wider">SYSTEM ONLINE</span>
                                </div>
                                <div className="text-[10px] text-white/30 font-mono px-2">
                                    MONITORING_ID: #KB-8291
                                </div>
                            </MotionDiv>
                        </MotionDiv>
                        <div className="absolute -inset-4 bg-primary-500/20 blur-[80px] -z-10 rounded-full opacity-50 pointer-events-none" />
                    </div>
                )}
            </div>
        </section>
    );
};