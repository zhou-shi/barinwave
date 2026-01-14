import { Button } from "@/modules/ui/shadcn/button";
import { cn } from "@/modules/lib/utils";
import { motion } from "framer-motion"; // Import Magic Library
import { ConfigIsland, IslandProps } from "../types";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "../lib/error-boundry";
import ScenePlaceholder from "../ui/spline/scene-paceholder";
import { ANIM } from "../lib/motion";

const Scene = lazy(() => import("@/modules/ui/spline/scene"));

// --- DATA DUMMY ---
interface ServiceItem {
    icon: string;
    color: string;
    title: string;
    desc: string;
    linkText: string;
    href: string;
}

interface StatItem {
    value: string;
    label: string;
}

interface NewsItem {
    date: string;
    category: string;
    title: string;
    desc: string;
    image: string;
}

// Ini bentuk spesifik Data Home
interface HomeSpecificData {
    services: ServiceItem[];
    stats: StatItem[];
    news: NewsItem[];
}

export const config: ConfigIsland = {mode: "interactive", build: false};

export const Home = ({Data}: Pick<IslandProps, "Data">) => {
    // TYPE ASSERTION / CASTING
    // Kita "memaksa" TypeScript percaya bahwa props.Data memiliki bentuk HomeSpecificData
    // Fallback ke objek kosong {} agar tidak error jika data null
    const data = (Data?.home || {}) as unknown as HomeSpecificData;
    // Sekarang Intellisense akan jalan!
    // data.services -> Akan muncul autocomplete
    const services = data.services || [];
    const stats = data.stats || [];
    const news = data.news || [];

    return (
        <div className="w-full overflow-hidden">
            
            {/* --- HERO SECTION --- */}
            <section className="relative min-h-[90vh] flex items-center justify-center bg-[#0B0E14] overflow-hidden pt-20">
                {/* Background Glow (Pulse Animation) */}
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-600/20 blur-[120px] rounded-full pointer-events-none" 
                />

                <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content (Text) */}
                    <motion.div 
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: false, amount: 0.3 }} // once: false agar animasi ulang saat scroll balik
                        variants={ANIM.container} // Stagger children
                        className="text-center lg:text-left"
                    >
                        <motion.div variants={ANIM.slideRight} className="inline-block px-4 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-400 text-sm font-medium mb-6">
                            ✨ Inspektorat Daerah Provinsi Kalimantan Barat
                        </motion.div>

                        <motion.h1 variants={ANIM.slideRight} className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight mb-6">
                            Mengawal <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Integritas</span>,<br />
                            Membangun <span className="text-white">Negeri.</span>
                        </motion.h1>

                        <motion.p variants={ANIM.slideRight} className="text-lg text-netral-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Wujudkan tata kelola pemerintahan yang bersih, transparan, dan akuntabel bersama kami.
                        </motion.p>

                        <motion.div variants={ANIM.slideUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button size="lg" className="rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 border-0 hover:shadow-[0_0_20px_rgba(var(--color-primary),0.5)] transition-all hover:scale-105 active:scale-95">
                                Lapor Sekarang (WBS)
                            </Button>
                            
                            <Button variant="outline" size="lg" className="rounded-full border-netral-700 text-white hover:bg-netral-800 transition-all hover:scale-105 active:scale-95">
                                Pelajari Layanan
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Right Content (Visual 3D) */}
                    <div className="relative hidden lg:block h-[600px] w-full">
                        {/* 3D Scene Wrapper - Animasi Pop In + Hover Float */}
                        <motion.div 
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: false }}
                            variants={ANIM.popIn}
                            className="absolute inset-0 bg-gradient-to-tr from-primary-900/10 to-transparent rounded-3xl border border-white/5 backdrop-blur-[2px] overflow-hidden shadow-2xl"
                        >
                            <ErrorBoundary fallback={<ScenePlaceholder isError={true} />}>
                                <Suspense fallback={<ScenePlaceholder />}>
                                    <Scene 
                                        sceneUrl="https://prod.spline.design/XzWmp-uI3N9d662r/scene.splinecode" 
                                        className="w-full h-full cursor-grab active:cursor-grabbing" 
                                    />
                                </Suspense>
                            </ErrorBoundary>

                            {/* Floating UI Overlay - Animasi Slide Up */}
                            <motion.div 
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
                            </motion.div>
                        </motion.div>

                        <div className="absolute -inset-4 bg-primary-500/20 blur-[80px] -z-10 rounded-full opacity-50 pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* --- STATS SECTION --- */}
            <section className="bg-[#0f1219] border-y border-netral-800 py-12">
                <div className="container mx-auto px-6">
                    {/* Menggunakan Stagger Container agar angka muncul satu per satu */}
                    <motion.div 
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: false, amount: 0.5 }}
                        variants={ANIM.container}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-netral-800"
                    >
                        {stats.map((stat, idx) => (
                            <motion.div key={idx} variants={ANIM.slideUp} className="px-4">
                                {/* Efek Hover pada Angka */}
                                <motion.h3 
                                    whileHover={{ scale: 1.1, color: "var(--color-primary)" }}
                                    className="text-4xl font-bold text-white mb-2 cursor-default"
                                >
                                    {stat.value}
                                </motion.h3>
                                <p className="text-netral-500 text-sm uppercase tracking-wider">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- SERVICES GRID --- */}
            <section id="layanan" className="bg-[#0B0E14] py-24 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div 
                        initial="hidden" whileInView="show" viewport={{ once: false }} variants={ANIM.slideUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Layanan Unggulan</h2>
                        <p className="text-netral-400">Akses layanan publik Inspektorat secara digital.</p>
                    </motion.div>

                    <motion.div 
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: false, amount: 0.2 }}
                        variants={ANIM.container} // Aktifkan Stagger
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {services.map((item, idx) => (
                            <motion.div 
                                key={idx} 
                                variants={ANIM.popIn} // Kartu muncul dengan efek Pop
                                whileHover={{ y: -10, transition: { duration: 0.3 } }} // Hover: Naik sedikit
                                className={cn(
                                    "group p-8 rounded-2xl bg-netral-900/50 border border-netral-800 transition-colors duration-300",
                                    item.color === 'primary' && "hover:border-primary-500/50",
                                    item.color === 'purple' && "hover:border-purple-500/50",
                                    item.color === 'blue' && "hover:border-blue-500/50",
                                    "hover:bg-netral-900"
                                )}
                            >
                                <motion.div 
                                    whileHover={{ rotate: [0, -10, 10, 0] }} // Icon goyang saat hover
                                    transition={{ duration: 0.5 }}
                                    className={cn(
                                        "w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6",
                                        item.color === 'primary' && "bg-primary-900/30 text-primary-400",
                                        item.color === 'purple' && "bg-purple-900/30 text-purple-400",
                                        item.color === 'blue' && "bg-blue-900/30 text-blue-400",
                                    )}
                                >
                                   {item.icon}
                                </motion.div>
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-netral-400 mb-6 text-sm leading-relaxed">{item.desc}</p>
                                <a href={item.href} className={cn(
                                    "font-medium flex items-center gap-2 text-sm",
                                    item.color === 'primary' && "text-primary-400 hover:text-primary-300",
                                    item.color === 'purple' && "text-purple-400 hover:text-purple-300",
                                    item.color === 'blue' && "text-blue-400 hover:text-blue-300",
                                )}>
                                    {item.linkText} &rarr;
                                </a>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- LATEST NEWS SECTION --- */}
            <section className="bg-[#0f1219] py-24 border-t border-netral-800">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <motion.div initial="hidden" whileInView="show" viewport={{ once: false }} variants={ANIM.slideRight}>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Berita & Kegiatan</h2>
                            <p className="text-netral-400">Update terbaru seputar pengawasan di Kalimantan Barat.</p>
                        </motion.div>
                        <Button variant="outline" className="border-netral-700 text-white hover:bg-netral-800">
                            Lihat Semua Berita
                        </Button>
                    </div>

                    <motion.div 
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: false, amount: 0.2 }}
                        variants={ANIM.container}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {news.map((news, idx) => (
                            <motion.a 
                                href="/berita/sample" 
                                key={idx} 
                                variants={ANIM.flipIn} // Efek Kartu Berputar
                                whileHover={{ scale: 1.02 }}
                                className="group block"
                            >
                                <div className="relative overflow-hidden rounded-xl bg-netral-800 aspect-video mb-4 border border-netral-800 group-hover:border-netral-600 transition-all">
                                    <img 
                                        src={news.image} 
                                        alt={news.title}
                                        className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" 
                                    />
                                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                                        {news.category}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-xs text-primary-400 font-mono">{news.date}</span>
                                    <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-2">
                                        {news.title}
                                    </h3>
                                    <p className="text-netral-400 text-sm line-clamp-2">
                                        {news.desc}
                                    </p>
                                </div>
                            </motion.a>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-20 bg-gradient-to-b from-[#0B0E14] to-primary-950/20">
                <div className="container mx-auto px-6 text-center">
                    <motion.div 
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
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button className="bg-white text-black hover:bg-netral-200 font-bold w-full sm:w-auto">
                                    Hubungi Kami
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="ghost" className="text-white hover:bg-white/10 w-full sm:w-auto">
                                    Pusat Informasi
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
};

export default Home;