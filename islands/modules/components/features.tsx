import { ConfigIsland, IslandProps } from "@/modules/types";
import { AlertTriangle, Layers } from "lucide-react";
import { safeEntry, safeLucideIcon } from "../lib/safe";
import { ANIM, MotionDiv } from "../lib/motion";
import { cn } from "../lib/utils";

const DEFAULT_PARAMS: FeaturesConfig= {
    title: "Our Features",
    description: "Discover the amazing features that make our product stand out in the market."
}

const DEFAULT_DATA : FeaturesContent = {
    items: [
        {
            title: "Fast Performance",
            description: "Experience lightning-fast load times and smooth interactions.",
            icon: "Zap",
            color: "primary-600",
            label: "New",
            url: "/features/performance"
        },
        {
            title: "Secure",
            description: "Top-notch security features to protect your data and privacy.",
            icon: "Shield",
            color: "secondary-600",
            label: "Updated",
            url: "/features/security"
        },
        {
            title: "Global Access",
            description: "Access your data from anywhere in the world, anytime.",
            icon: "Globe",
            color: "tertiary-600",
            label: "Popular",
            url: "/features/global-access"
        },
        {
            title: "Powerful Analytics",
            description: "Gain insights with our comprehensive analytics tools.",
            icon: "Cpu",
            color: "indigo-600",
            label: "Beta",
            url: "/features/analytics"
        }
    ]
}

type FeaturesConfig = {
    title?: string;
    description?: string;
}

type FeatureItem = {
    title: string;
    description: string;
    icon?: string;
    color?: string;
    label?: string;
    url?: string;
}

type FeaturesContent = {
    items: FeatureItem[];
}


export default function Features({ Data = {}, Params = {} }: IslandProps) {
    const content = safeEntry<FeaturesContent>(Data || {}, DEFAULT_DATA);
    const config = safeEntry<FeaturesConfig>(Params || {}, DEFAULT_PARAMS);
    const items = content.items;

    return (
        <section className="w-full py-24 bg-primary-950/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="container mx-auto px-6 relative z-10">
                {/* Header Section */}
                <MotionDiv className="text-center mb-16" initial="hidden" whileInView="show" viewport={{ once: false }} variants={ANIM.slideUp}>
                    {config.title && (
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            {config.title}
                        </h2>
                    )}
                    {config.description && (
                        <p className="text-netral-400 text-lg">
                            {config.description}
                        </p>
                    )}
                </MotionDiv>

                {/* Grid */}
                <MotionDiv 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.2 }}
                    variants={ANIM.container} 
                >
                    {items.map((item, idx) => {
                        // Resolve Icon Component
                        const IconComponent = item.icon 
                            ? safeLucideIcon(item.icon) || AlertTriangle
                            : Layers;

                        return (
                            <MotionDiv
                                key={idx}
                                variants={ANIM.popIn} 
                                whileHover={{ y: -10, transition: { duration: 0.3 } }} 
                                className={cn(
                                    "group p-8 rounded-2xl bg-netral-900/50 border border-netral-800 transition-colors duration-300",
                                    item.color ? `hover:border-${item.color}/50` : "hover:border-primary-600"
                                )}
                            >
                                <MotionDiv 
                                    whileHover={{ rotate: [0, -10, 10, 0] }} // Icon goyang saat hover
                                    transition={{ duration: 0.5 }}
                                    className={cn(
                                        "w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 mb-6",
                                        item.color && `bg-${item.color}/30 text-${item.color}-400`
                                    )}
                                >
                                    {IconComponent && <IconComponent/>}
                                </MotionDiv>
                                
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors">
                                    {item.title}
                                </h3>
                                
                                <p className="text-netral-400 leading-relaxed text-sm">
                                    {item.description}
                                </p>
                                {item.label && item.url && (
                                    <a 
                                        href={item.url} 
                                        className={cn(
                                            "font-medium flex items-center gap-2 text-sm",
                                            item.color ? `text-${item.color}-400 hover:underline` : "text-primary-300 hover:underline"
                                        )}
                                    >
                                        {item.label}
                                    </a>
                                )}
                            </MotionDiv>
                        );
                    })}
                </MotionDiv>
            </div>
        </section>
    );
};