import { ANIM, MotionDiv } from "../lib/motion"
import { safeEntry } from "../lib/safe"
import { ConfigIsland, IslandProps } from "../types"
import { Button } from "../ui/shadcn/button"
import { ButtonConfig } from "./types"

const DEFAULT_DATA: CTAConfig = {
    buttons: [
        {
            label: "Hubungi Kami",
            url: "/contact",
            variant: "default"
        },
        {
            label: "Pusat Informasi",
            url: "/info-center",
            variant: "ghost"
        }
    ]
}

type CTAConfig = {
    buttons: ButtonConfig[];
}

const CTA = ({ Params = {}} : IslandProps) => {
    const config = safeEntry<CTAConfig>(Params || {}, DEFAULT_DATA);

    return (
        <section className="py-20 bg-gradient-to-b from-secondary-950/20 to-primary-950/20">
            <div className="container mx-auto px-6 text-center">
                <MotionDiv 
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false }}
                    variants={ANIM.popIn}
                    className="max-w-3xl mx-auto bg-netral-900/50 border border-netral-800 p-8 md:p-12 rounded-3xl backdrop-blur-sm"
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Butuh Informasi Lebih Lanjut?
                    </h2>
                    <p className="text-netral-400 mb-8">
                        Jika Anda memiliki pertanyaan seputar pengawasan, gratifikasi, atau layanan kami lainnya, silakan hubungi kami atau cek FAQ.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            { config.buttons.map((btn, idx) => (
                                <Button 
                                    key={idx}
                                    variant={btn.variant  ? btn.variant : "default"}
                                    className="bg-primary-100 text-primary-950 hover:bg-netral-200 font-bold w-full sm:w-auto mx-4"
                                >
                                    <a href={btn.url}>{btn.label}</a>
                                </Button>
                            ))}
                        </MotionDiv>
                    </div>
                </MotionDiv>
            </div>
        </section>
    );
}

export default CTA