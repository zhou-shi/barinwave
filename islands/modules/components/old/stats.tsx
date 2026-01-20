import { IslandProps } from "@/modules/types";
import { safeEntry } from "../../lib/safe";
import { ANIM, MotionDiv, MotionH3, MotionP } from "../../lib/motion";

const DEFAUT_DATA: StatsContent = {
    items: [
        { value: "10K+", label: "Users" },
        { value: "500+", label: "Projects" },
        { value: "1M+", label: "Downloads" },
        { value: "99.9%", label: "Uptime" }
    ]
};

type StatItem = { value: string; label: string; }
type StatsContent = { items: StatItem[]; }

export default function Stats({ Data = {} }: IslandProps) {
    const content = safeEntry<StatsContent>(Data || {}, DEFAUT_DATA);
    const items = content.items;
    return (
        <section className="bg-primary-950/5 border-y border-netral-800 py-12">
            <div className="container mx-auto px-6">
                <MotionDiv 
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-netral-800"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.5 }}
                    variants={ANIM.container}    
                >
                    {items.map((stat, idx) => (
                        <MotionDiv 
                            key={idx} 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="px-4"
                        >
                            <MotionH3 className="text-4xl font-bold text-white mb-2">{stat.value}</MotionH3>
                            <MotionP className="text-netral-500 text-sm uppercase tracking-wider">{stat.label}</MotionP>
                        </MotionDiv>
                    ))}
                </MotionDiv>
            </div>
        </section>
    );
}