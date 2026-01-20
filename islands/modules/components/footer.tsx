import { Fragment, ComponentChildren } from "preact";
import { 
    MapPin, Mail, Phone, Clock, ArrowRight,
    Instagram, Youtube, Facebook, Twitter, Linkedin, Music, Globe, LucideIcon 
} from "lucide-react";
import { h } from "@/modules/lib/hugo-bridge"; 
import { ConfigIsland } from "../types";
import { HugoRaw } from "../ui/brainwave/hugo-raw";

// --- 1. TYPE DEFINITIONS ---

interface FadeInProps {
    children: ComponentChildren;
    delay?: number;
    className?: string;
}

interface SocialConfig {
    icon: LucideIcon;
    containerClass: string;
    iconClass: string;
}

interface SocialItemProps {
    paramKey: string;
    config: SocialConfig;
}

// --- 2. CONFIGURATION MAP ---

const SOCIAL_PLATFORMS: Record<string, SocialConfig> = {
    instagram: {
        icon: Instagram,
        containerClass: "hover:border-primary-500 hover:bg-primary-900/20",
        iconClass: "group-hover:text-primary-400"
    },
    facebook: {
        icon: Facebook,
        containerClass: "hover:border-blue-600 hover:bg-blue-900/20",
        iconClass: "group-hover:text-blue-500"
    },
    youtube: {
        icon: Youtube,
        containerClass: "hover:border-red-600 hover:bg-red-900/20",
        iconClass: "group-hover:text-red-500"
    },
    twitter: {
        icon: Twitter,
        containerClass: "hover:border-sky-500 hover:bg-sky-900/20",
        iconClass: "group-hover:text-sky-500"
    },
    linkedin: {
        icon: Linkedin,
        containerClass: "hover:border-blue-700 hover:bg-blue-900/20",
        iconClass: "group-hover:text-blue-700"
    },
    tiktok: {
        icon: Music,
        containerClass: "hover:border-pink-500 hover:bg-pink-900/20",
        iconClass: "group-hover:text-pink-500"
    },
    website: {
        icon: Globe,
        containerClass: "hover:border-emerald-500 hover:bg-emerald-900/20",
        iconClass: "group-hover:text-emerald-500"
    }
};

export const config: ConfigIsland = {
    mode: "static", 
    name: "footer", 
    outputDir: ['layouts', 'partials', 'components']
};


const FadeIn = ({ children, delay = 0, className = "" }: FadeInProps) => (
    <div 
        className={`scroll-animate opacity-0 translate-y-12 transition-all duration-1000 ease-spring ${className}`}
        style={{ transitionDelay: `${delay}ms` }}
    >
        {children}
    </div>
);

const SocialItem = ({ paramKey, config }: SocialItemProps) => (
    <Fragment>
        {/* Kita manual construct string 'with' karena h.get khusus untuk output value */}
        <HugoRaw code={`{{ with site.Params.footer.social.${paramKey} }}`} />
            <a 
                href="{{ . }}" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`group w-10 h-10 rounded-full bg-netral-900 border border-netral-800 flex items-center justify-center text-netral-400 hover:text-white transition-all duration-300 hover:scale-110 ${config.containerClass}`}
            >
                <config.icon size={18} className={`transition-colors ${config.iconClass}`} />
            </a>
        <HugoRaw code="{{ end }}" />
    </Fragment>
);

// --- 4. MAIN COMPONENT ---

export const Footer = () => {
    // Definisi Data Menggunakan h.footer() Shortcut
    const D = {
        TITLE:    h.footer("identity.title"),
        SUBTITLE: h.footer("identity.subtitle"),
        DESC:     h.footer("identity.description"),
        LOGO:     h.footer("identity.logo", "`/images/exodus.svg`"),
        
        ADDR:     h.footer("contact.address"),
        PHONE:    h.footer("contact.phone"),
        EMAIL:    h.footer("contact.email"),
        
        YEAR:     "{{ now.Year }}",
        // Logic split string (Advanced)
        SENIN:    '{{ index (split site.Params.footer.hours.weekdays `: `) 1 }}',
        JUMAT:    '{{ index (split site.Params.footer.hours.friday `: `) 1 }}',
    };

    return (
        <footer className="bg-[#0B0E14] border-t border-netral-800 pt-16 pb-8 text-sm overflow-hidden relative z-10">
            <div className="container mx-auto px-6">
                
                {/* Script Observer Ringan */}
                <script dangerouslySetInnerHTML={{ __html: `
                    document.addEventListener("DOMContentLoaded", () => {
                        const observer = new IntersectionObserver((entries) => {
                            entries.forEach(e => {
                                if(e.isIntersecting) {
                                    e.target.classList.remove('opacity-0', 'translate-y-12');
                                    e.target.classList.add('opacity-100', 'translate-y-0');
                                }
                            });
                        }, { threshold: 0.1 }); 
                        document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
                    });
                `}} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">                    
                    
                    {/* KOLOM 1: IDENTITAS */}
                    <div className="lg:col-span-4 space-y-6">
                        <FadeIn delay={0}>
                            <div className="flex items-center gap-3">
                                <img src={D.LOGO} alt="Logo" className="w-10 h-12 object-contain" /> 
                                <div>
                                    <h3 className="text-white font-bold text-lg leading-tight"><HugoRaw code={D.TITLE} /></h3>
                                    <p className="text-netral-500 text-xs uppercase tracking-wider"><HugoRaw code={D.SUBTITLE} /></p>
                                </div>
                            </div>
                        </FadeIn>

                        <FadeIn delay={100}>
                            <p className="text-netral-400 leading-relaxed"><HugoRaw code={D.DESC} /></p>
                        </FadeIn>

                        <FadeIn delay={200}>
                            <div className="flex gap-4 flex-wrap">
                                {/* DYNAMIC SOCIAL LOOP */}
                                {Object.entries(SOCIAL_PLATFORMS).map(([key, config]) => (
                                    <SocialItem key={key} paramKey={key} config={config} />
                                ))}
                            </div>
                        </FadeIn>
                    </div>

                    {/* KOLOM 2: LAYANAN PUBLIK (Menu) */}
                    <div className="lg:col-span-2 lg:col-start-6 space-y-6">
                        <FadeIn delay={150}>
                            <h4 className="text-white font-bold mb-4">Layanan Publik</h4>
                            <ul className="space-y-3">
                                {/* Gunakan h.menu() helper */}
                                <HugoRaw code={h.menu("layanan")} />
                                    <HugoRaw code={h.range("Children", ".")} />
                                        <li className="block">
                                            <a href="{{ .URL }}" className="text-netral-400 hover:text-primary-400 transition-colors flex items-center gap-2 group">
                                                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 ease-spring" />
                                                <HugoRaw code='{{ .Name }}' />
                                            </a>
                                        </li>
                                    <HugoRaw code={h.end()} />
                                <HugoRaw code={h.end()} />
                            </ul>
                        </FadeIn>
                    </div>

                    {/* KOLOM 3: TAUTAN TERKAIT (Dinamis dari Params) */}
                    <div className="lg:col-span-2 space-y-6">
                        <FadeIn delay={250}>
                            <h4 className="text-white font-bold mb-4">Tautan Terkait</h4>
                            <ul className="space-y-3">
                                {/* Gunakan h.range() helper menunjuk ke footer.links */}
                                <HugoRaw code={h.range("links", "site.Params.footer")} />
                                    <li>
                                        <a href="{{ .url }}" target="_blank" className="text-netral-400 hover:text-white transition-colors block hover:translate-x-1 duration-300">
                                            <HugoRaw code="{{ .name }}" />
                                        </a>
                                    </li>
                                <HugoRaw code={h.end()} />
                            </ul>
                        </FadeIn>
                    </div>

                    {/* KOLOM 4: HUBUNGI KAMI */}
                    <div className="lg:col-span-4 lg:col-start-10 space-y-6">
                        <FadeIn delay={350}>
                            <h4 className="text-white font-bold mb-4">Hubungi Kami</h4>
                            
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 text-netral-400 group hover:text-white transition-colors">
                                    <MapPin className="text-primary-500 shrink-0 mt-1 group-hover:animate-bounce" size={18} />
                                    <span className="whitespace-pre-line"><HugoRaw code={D.ADDR} /></span>
                                </div>

                                <div className="flex items-center gap-3 text-netral-400 group hover:text-white transition-colors">
                                    <Mail className="text-primary-500 shrink-0 group-hover:scale-110 transition-transform" size={18} />
                                    <a href={`mailto:${D.EMAIL}`}><HugoRaw code={D.EMAIL} /></a>
                                </div>

                                <div className="flex items-center gap-3 text-netral-400 group hover:text-white transition-colors">
                                    <Phone className="text-primary-500 shrink-0 group-hover:rotate-12 transition-transform" size={18} />
                                    <span><HugoRaw code={D.PHONE} /></span>
                                </div>

                                <div className="p-4 rounded-xl bg-netral-900/50 border border-netral-800 mt-4 hover:border-primary-500/50 transition-all duration-500 hover:shadow-lg hover:shadow-primary-500/10">
                                    <div className="flex items-center gap-2 mb-2 text-white font-medium">
                                        <Clock size={16} className="text-primary-400" />
                                        <span>Jam Pelayanan</span>
                                    </div>
                                    <div className="space-y-2 text-xs text-netral-400">
                                        <div className="flex justify-between border-b border-netral-800 pb-2">
                                            <span>Senin - Kamis</span>
                                            <HugoRaw code={D.SENIN} />
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Jumat</span>
                                            <HugoRaw code={D.JUMAT} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>

                {/* COPYRIGHT */}
                <FadeIn delay={500} className="border-t border-netral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-netral-500 text-xs">
                        &copy; <HugoRaw code={D.YEAR} /> <HugoRaw code={D.TITLE} />. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-xs text-netral-500">
                        <a href="#" className="hover:text-white hover:underline transition-colors">Kebijakan Privasi</a>
                        <a href="#" className="hover:text-white hover:underline transition-colors">Peta Situs</a>
                    </div>
                </FadeIn>
            </div>
        </footer>
    );
};




















// import { 
//     MapPin, Mail, Phone, Clock, 
//     Facebook, Instagram, Youtube, ArrowRight 
// } from "lucide-react";

// const HugoRaw = ({ code }: { code: string }) => (
//     <span dangerouslySetInnerHTML={{ __html: code }} />
// );

// // --- KOMPONEN HELPER ANIMASI (Wrapper) ---
// // Kita gunakan class 'ease-spring' yang baru kita buat di main.css
// const FadeIn = ({ children, delay = 0, className = "" }: { children: any, delay?: number, className?: string }) => {
//     return (
//         <div 
//             className={`scroll-animate opacity-0 translate-y-12 transition-all duration-1000 ease-spring ${className}`}
//             style={{ transitionDelay: `${delay}ms` }}
//         >
//             {children}
//         </div>
//     );
// };

// export const Footer = () => {
//     // Definisi Data untuk Hugo Template
//     const D = {
//         TITLE: "{{ site.Params.footer.identity.title }}",
//         SUBTITLE: "{{ site.Params.footer.identity.subtitle }}",
//         DESC: "{{ site.Params.footer.identity.description }}",
//         LOGO: '{{ site.Params.footer.identity.logo | default `/images/logo-kalbar.png` }}',
//         ADDR: "{{ site.Params.footer.contact.address }}",
//         PHONE: "{{ site.Params.footer.contact.phone }}",
//         EMAIL: "{{ site.Params.footer.contact.email }}",
//         YEAR: "{{ now.Year }}",
//         SENIN: '{{ index (split site.Params.footer.hours.weekdays `: `) 1 }}',
//         JUMAT: '{{ index (split site.Params.footer.hours.friday `: `) 1 }}',
//     };

//     return (
//         <footer className="bg-[#0B0E14] border-t border-netral-800 pt-16 pb-8 text-sm overflow-hidden relative z-10">
//             <div className="container mx-auto px-6">
                
//                 {/* --- MICRO SCRIPT (Vanilla JS Observer) --- */}
//                 {/* Script ini sangat ringan, tidak membebani seperti React Runtime */}
//                 <script dangerouslySetInnerHTML={{ __html: `
//                     document.addEventListener("DOMContentLoaded", () => {
//                         // Opsi Observer: threshold 0.1 artinya animasi mulai saat 10% elemen terlihat
//                         const observer = new IntersectionObserver((entries) => {
//                             entries.forEach(entry => {
//                                 if (entry.isIntersecting) {
//                                     // ANIMASI MASUK (IN)
//                                     // Hapus state awal (sembunyi/turun), masukkan state akhir (normal)
//                                     entry.target.classList.remove('opacity-0', 'translate-y-12', 'scale-95');
//                                     entry.target.classList.add('opacity-100', 'translate-y-0', 'scale-100');
//                                 } else {
//                                     // ANIMASI KELUAR (OUT)
//                                     // Kembalikan ke posisi awal agar bisa dianimasikan lagi nanti
//                                     entry.target.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
//                                     entry.target.classList.add('opacity-0', 'translate-y-12', 'scale-95');
//                                 }
//                             });
//                         }, { threshold: 0.1 }); 

//                         // Target semua elemen dengan class .scroll-animate
//                         document.querySelectorAll('.scroll-animate').forEach((el) => observer.observe(el));
//                     });
//                 `}} />

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">                    
//                     {/* KOLOM 1: IDENTITAS */}
//                     <div className="lg:col-span-4 space-y-6">
//                         <FadeIn delay={0}>
//                             <div className="flex items-center gap-3">
//                                 <img src={D.LOGO} alt="Logo" className="w-10 h-12 object-contain" /> 
//                                 <div>
//                                     <h3 className="text-white font-bold text-lg leading-tight">{D.TITLE}</h3>
//                                     <p className="text-netral-500 text-xs uppercase tracking-wider">{D.SUBTITLE}</p>
//                                 </div>
//                             </div>
//                         </FadeIn>

//                         <FadeIn delay={100}>
//                             <p className="text-netral-400 leading-relaxed">
//                                 {D.DESC}
//                             </p>
//                         </FadeIn>

//                         <FadeIn delay={200}>
//                             <div className="flex gap-4">
//                                 {/* Icon dengan efek hover scale manual (tanpa js berat) */}
//                                 <HugoRaw code='{{ with site.Params.footer.social.instagram }}' />
//                                     <a href="{{ . }}" target="_blank" className="group w-10 h-10 rounded-full bg-netral-900 border border-netral-800 flex items-center justify-center text-netral-400 hover:text-white hover:border-primary-500 hover:bg-primary-900/20 transition-all duration-300 hover:scale-110">
//                                         <Instagram size={18} className="group-hover:text-primary-400 transition-colors" />
//                                     </a>
//                                 <HugoRaw code='{{ end }}' />

//                                 <HugoRaw code='{{ with site.Params.footer.social.youtube }}' />
//                                     <a href="{{ . }}" target="_blank" className="group w-10 h-10 rounded-full bg-netral-900 border border-netral-800 flex items-center justify-center text-netral-400 hover:text-white hover:border-red-500 hover:bg-red-900/20 transition-all duration-300 hover:scale-110">
//                                         <Youtube size={18} className="group-hover:text-red-500 transition-colors" />
//                                     </a>
//                                 <HugoRaw code='{{ end }}' />

//                                 <HugoRaw code='{{ with site.Params.footer.social.facebook }}' />
//                                     <a href="{{ . }}" target="_blank" className="group w-10 h-10 rounded-full bg-netral-900 border border-netral-800 flex items-center justify-center text-netral-400 hover:text-white hover:border-blue-500 hover:bg-blue-900/20 transition-all duration-300 hover:scale-110">
//                                         <Facebook size={18} className="group-hover:text-blue-500 transition-colors" />
//                                     </a>
//                                 <HugoRaw code='{{ end }}' />
//                             </div>
//                         </FadeIn>
//                     </div>

//                     {/* KOLOM 2: LAYANAN PUBLIK */}
//                     <div className="lg:col-span-2 lg:col-start-6 space-y-6">
//                         <FadeIn delay={150}>
//                             <h4 className="text-white font-bold mb-4">Layanan Publik</h4>
//                             <ul className="space-y-3">
//                                 <HugoRaw code='{{ range site.Menus.main }}' />
//                                     <HugoRaw code='{{ if eq .Identifier "layanan" }}' />
//                                         <HugoRaw code='{{ range .Children }}' />
//                                             <li className="block">
//                                                 <a href="{{ .URL }}" className="text-netral-400 hover:text-primary-400 transition-colors flex items-center gap-2 group">
//                                                     <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 ease-spring" />
//                                                     <HugoRaw code='{{ .Name }}' />
//                                                 </a>
//                                             </li>
//                                         <HugoRaw code='{{ end }}' />
//                                     <HugoRaw code='{{ end }}' />
//                                 <HugoRaw code='{{ end }}' />
//                             </ul>
//                         </FadeIn>
//                     </div>

//                     {/* KOLOM 3: TAUTAN TERKAIT */}
//                     <div className="lg:col-span-2 space-y-6">
//                         <FadeIn delay={250}>
//                             <h4 className="text-white font-bold mb-4">Tautan Terkait</h4>
//                             <ul className="space-y-3">
//                                 <li><a href="https://kalbarprov.go.id" target="_blank" className="text-netral-400 hover:text-white transition-colors block hover:translate-x-1 duration-300">Pemprov Kalbar</a></li>
//                                 <li><a href="https://kpk.go.id" target="_blank" className="text-netral-400 hover:text-white transition-colors block hover:translate-x-1 duration-300">KPK RI</a></li>
//                                 <li><a href="https://bpkp.go.id" target="_blank" className="text-netral-400 hover:text-white transition-colors block hover:translate-x-1 duration-300">BPKP</a></li>
//                             </ul>
//                         </FadeIn>
//                     </div>

//                     {/* KOLOM 4: KONTAK KAMI */}
//                     <div className="lg:col-span-4 lg:col-start-10 space-y-6">
//                         <FadeIn delay={350}>
//                             <h4 className="text-white font-bold mb-4">Hubungi Kami</h4>
                            
//                             <div className="space-y-4">
//                                 <div className="flex items-start gap-3 text-netral-400 group">
//                                     <MapPin className="text-primary-500 shrink-0 mt-1 group-hover:animate-bounce" size={18} />
//                                     <span className="whitespace-pre-line group-hover:text-white transition-colors">{D.ADDR}</span>
//                                 </div>

//                                 <div className="flex items-center gap-3 text-netral-400 group">
//                                     <Mail className="text-primary-500 shrink-0 group-hover:scale-110 transition-transform" size={18} />
//                                     <a href={`mailto:${D.EMAIL}`} className="hover:text-white transition-colors">
//                                         {D.EMAIL}
//                                     </a>
//                                 </div>

//                                 <div className="flex items-center gap-3 text-netral-400 group">
//                                     <Phone className="text-primary-500 shrink-0 group-hover:rotate-12 transition-transform" size={18} />
//                                     <span>{D.PHONE}</span>
//                                 </div>

//                                 <div className="p-4 rounded-xl bg-netral-900/50 border border-netral-800 mt-4 hover:border-primary-500/50 hover:bg-netral-900 transition-all duration-500 ease-smooth hover:shadow-lg hover:shadow-primary-500/10">
//                                     <div className="flex items-center gap-2 mb-2 text-white font-medium">
//                                         <Clock size={16} className="text-primary-400" />
//                                         <span>Jam Pelayanan</span>
//                                     </div>
//                                     <div className="flex justify-between text-xs text-netral-400 border-b border-netral-800 pb-2 mb-2">
//                                         <span>Senin - Kamis</span>
//                                         <span dangerouslySetInnerHTML={{ __html: D.SENIN }} />
//                                     </div>
//                                     <div className="flex justify-between text-xs text-netral-400">
//                                         <span>Jumat</span>
//                                         <span dangerouslySetInnerHTML={{ __html: D.JUMAT }} />
//                                     </div>
//                                 </div>
//                             </div>
//                         </FadeIn>
//                     </div>
//                 </div>

//                 {/* COPYRIGHT */}
//                 <FadeIn delay={500} className="border-t border-netral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
//                     <p className="text-netral-500 text-xs">
//                         &copy; {D.YEAR} {D.TITLE}. All rights reserved.
//                     </p>
//                     <div className="flex items-center gap-6 text-xs text-netral-500">
//                         <a href="#" className="hover:text-white transition-colors hover:underline">Kebijakan Privasi</a>
//                         <a href="#" className="hover:text-white transition-colors hover:underline">Peta Situs</a>
//                     </div>
//                 </FadeIn>
//             </div>
//         </footer>
//     );
// };