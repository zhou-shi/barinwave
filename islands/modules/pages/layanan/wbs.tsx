import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion"; 
import { ConfigIsland, IslandProps } from "@/modules/types";

// --- IMPORT ANIMASI TERPUSAT ---
import { ANIM } from "@/modules/lib/motion"; 

// --- IMPORT COMPONENTS & ICONS ---
import { Button } from "@/modules/ui/shadcn/button";
import { Input } from "@/modules/ui/shadcn/input";
import { Textarea } from "@/modules/ui/shadcn/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/modules/ui/shadcn/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/modules/ui/shadcn/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/ui/shadcn/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/modules/ui/shadcn/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/modules/ui/shadcn/accordion";
import { ShieldCheck, Lock, FileWarning, EyeOff, Send, Siren, Search, CheckCircle2 } from "lucide-react";

const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;
const FormProvider = Form;

// --- DATA CONSTANTS (Updated Colors) ---
const VIOLATIONS = [
    // Korupsi (Bahaya) -> Tertiary (Red)
    { title: "Korupsi & Suap", desc: "Penyalahgunaan anggaran, penerimaan suap, atau pemerasan.", icon: <Siren className="text-tertiary-400" size={32} /> },
    // Benturan Kepentingan (Warning) -> Secondary (Amber)
    { title: "Benturan Kepentingan", desc: "Pengambilan keputusan yang menguntungkan pribadi.", icon: <FileWarning className="text-secondary-400" size={32} /> },
    // Disiplin (Standar) -> Primary (Emerald)
    { title: "Pelanggaran Disiplin", desc: "Pelanggaran kode etik ASN dan peraturan.", icon: <ShieldCheck className="text-primary-400" size={32} /> }
];

const FAQS = [
    { question: "Apakah identitas saya aman?", answer: "Sangat aman. Inspektorat menjamin kerahasiaan identitas pelapor. Anda dapat melapor sebagai anonim." },
    { question: "Apa saja bukti yang perlu dilampirkan?", answer: "Foto, dokumen, rekaman suara, atau video yang menunjukkan indikasi pelanggaran." },
    { question: "Berapa lama laporan diproses?", answer: "Verifikasi maksimal 3 hari kerja. Investigasi maksimal 30 hari kerja." }
];

// --- TYPES ---
interface ReportValues {
    judul: string;
    kategori: string;
    lokasi: string;
    isi: string;
}
interface StatusValues {
    ticketId: string;
}

// --- COMPONENT: FORM BUAT LAPORAN ---
const ReportForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const form = useForm<ReportValues>();
    const { isSubmitting } = form.formState;

    const onSubmit = async (data: ReportValues) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("Laporan Terkirim:", data);
        onSuccess();
        alert("Laporan Berhasil! Kode Tiket: WBS-2026-XYZ");
    };

    return (
        <FormProvider {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <MotionDiv initial="hidden" animate="show" variants={ANIM.container} className="space-y-4">
                    
                    <MotionDiv variants={ANIM.slideUp}>
                        <FormField
                            control={form.control}
                            name="judul"
                            rules={{ required: "Judul laporan wajib diisi" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-netral-300">Judul Laporan</FormLabel>
                                    <FormControl>
                                        {/* Input: bg-netral-950, Focus Ring Primary */}
                                        <Input placeholder="Contoh: Dugaan Pungli di Dinas X" className="bg-netral-950 border-netral-700 focus-visible:ring-primary-500" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-tertiary-400" />
                                </FormItem>
                            )}
                        />
                    </MotionDiv>

                    <div className="grid grid-cols-2 gap-4">
                        <MotionDiv variants={ANIM.slideUp}>
                            <FormField
                                control={form.control}
                                name="kategori"
                                rules={{ required: "Pilih kategori" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-netral-300">Kategori</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-netral-950 border-netral-700 focus:ring-primary-500">
                                                    <SelectValue placeholder="Pilih..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-netral-900 border-netral-800 text-netral-50">
                                                <SelectItem value="korupsi">Korupsi</SelectItem>
                                                <SelectItem value="pungli">Pungli</SelectItem>
                                                <SelectItem value="gratifikasi">Gratifikasi</SelectItem>
                                                <SelectItem value="etik">Kode Etik</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-tertiary-400" />
                                    </FormItem>
                                )}
                            />
                        </MotionDiv>
                        
                        <MotionDiv variants={ANIM.slideUp}>
                            <FormField
                                control={form.control}
                                name="lokasi"
                                rules={{ required: "Wajib diisi" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-netral-300">Lokasi</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Instansi / Daerah" className="bg-netral-950 border-netral-700 focus-visible:ring-primary-500" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-tertiary-400" />
                                    </FormItem>
                                )}
                            />
                        </MotionDiv>
                    </div>

                    <MotionDiv variants={ANIM.slideUp}>
                        <FormField
                            control={form.control}
                            name="isi"
                            rules={{ required: "Wajib diisi", minLength: { value: 20, message: "Min 20 karakter" } }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-netral-300">Kronologi</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Jelaskan detail kejadian..." className="bg-netral-950 border-netral-700 focus-visible:ring-primary-500 resize-none min-h-[100px]" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-tertiary-400" />
                                </FormItem>
                            )}
                        />
                    </MotionDiv>

                    <MotionDiv variants={ANIM.slideUp}>
                        <Button type="submit" disabled={isSubmitting} className="w-full bg-primary-600 hover:bg-primary-500 text-netral-50 font-bold h-12 mt-2">
                            {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
                        </Button>
                    </MotionDiv>

                </MotionDiv>
            </form>
        </FormProvider>
    );
};

// --- COMPONENT: FORM STATUS ---
const StatusForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const form = useForm<StatusValues>();
    
    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(() => { onSuccess(); alert("Tracking..."); })} className="space-y-6 py-4">
                <MotionDiv initial="hidden" animate="show" variants={ANIM.container}>
                    <MotionDiv variants={ANIM.popIn} className="text-center">
                        <div className="w-16 h-16 bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-500 animate-pulse">
                            <Search size={32} />
                        </div>
                        <p className="text-netral-400 text-sm mb-4">Masukkan Nomor Tiket Anda.</p>
                    </MotionDiv>

                    <MotionDiv variants={ANIM.slideUp}>
                        <FormField
                            control={form.control}
                            name="ticketId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="WBS-2026-XXX" className="bg-netral-950 border-netral-700 text-center font-mono text-lg uppercase h-14 focus-visible:ring-primary-500" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </MotionDiv>
                    
                    <MotionDiv variants={ANIM.slideUp} className="mt-4">
                        <Button type="submit" className="w-full bg-netral-50 text-primary-950 hover:bg-primary-50 font-bold h-12">
                            Lacak Laporan
                        </Button>
                    </MotionDiv>
                </MotionDiv>
            </form>
        </FormProvider>
    );
};

export const config: ConfigIsland = {mode: "interactive", build: false};

// --- MAIN PAGE ---
export const WBS = ({ Data }: IslandProps) => {
    const [createOpen, setCreateOpen] = useState(false);
    const [checkOpen, setCheckOpen] = useState(false);

    return (
        // Background Page: netral-950 (Darkest)
        <div className="w-full overflow-hidden bg-netral-950 min-h-screen pt-20">
            
            {/* MODALS: bg-netral-900 (Slightly Lighter than Page) */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="bg-netral-900 border-netral-800 text-netral-50 sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-primary-500">
                            <ShieldCheck size={20}/> Buat Laporan Baru
                        </DialogTitle>
                        <DialogDescription className="text-netral-400">Identitas terenkripsi. Aman & Rahasia.</DialogDescription>
                    </DialogHeader>
                    <ReportForm onSuccess={() => setCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={checkOpen} onOpenChange={setCheckOpen}>
                <DialogContent className="bg-netral-900 border-netral-800 text-netral-50 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-primary-500">Lacak Status</DialogTitle>
                        <DialogDescription className="text-netral-400">Pantau progres laporan Anda.</DialogDescription>
                    </DialogHeader>
                    <StatusForm onSuccess={() => setCheckOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* --- HERO SECTION --- */}
            <section className="relative py-20 lg:py-32 px-6 container mx-auto text-center">
                {/* Glow: Primary */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-900/20 blur-[100px] rounded-full pointer-events-none" />
                
                <MotionDiv initial="hidden" animate="show" variants={ANIM.container} className="relative z-10 max-w-4xl mx-auto">
                    <MotionDiv variants={ANIM.slideUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-900/30 border border-primary-500/30 text-primary-400 text-sm font-medium mb-8">
                        <Lock size={14} /> Rahasia & Terenkripsi
                    </MotionDiv>
                    
                    <MotionH1 variants={ANIM.slideUp} className="text-4xl md:text-6xl font-bold text-netral-50 mb-6 leading-tight">
                        Whistleblowing System <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">(WBS)</span>
                    </MotionH1>
                    
                    <MotionP variants={ANIM.slideUp} className="text-lg text-netral-400 mb-10 max-w-2xl mx-auto">
                        Saluran pelaporan resmi bagi masyarakat atau ASN untuk melaporkan indikasi tindak pidana korupsi.
                    </MotionP>

                    <MotionDiv variants={ANIM.slideUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" onClick={() => setCreateOpen(true)} className="rounded-full bg-primary-600 hover:bg-primary-500 text-netral-50 border-0 hover:scale-105 transition-transform shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary-500),transparent_70%)]">
                            <Send className="w-4 h-4 mr-2" /> Buat Laporan Baru
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => setCheckOpen(true)} className="rounded-full border-netral-700 text-netral-50 hover:bg-netral-800 hover:scale-105 transition-transform">
                            Cek Status
                        </Button>
                    </MotionDiv>
                </MotionDiv>
            </section>

            {/* --- KRITERIA PELAPORAN --- */}
            <section className="py-20 border-t border-netral-800 bg-netral-900">
                <div className="container mx-auto px-6">
                    <MotionDiv initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={ANIM.slideUp} className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-netral-50 mb-4">Apa yang Bisa Dilaporkan?</h2>
                        <p className="text-netral-400">Lingkup pengaduan yang ditangani oleh Inspektorat Daerah.</p>
                    </MotionDiv>

                    <MotionDiv 
                        initial="hidden" 
                        whileInView="show" 
                        viewport={{ once: true, amount: 0.2 }} 
                        variants={ANIM.container} 
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {VIOLATIONS.map((item, idx) => (
                            <MotionDiv key={idx} variants={ANIM.popIn} whileHover={{ y: -10, transition: { duration: 0.3 } }} className="h-full">
                                <Card className="bg-netral-950 border-netral-800 hover:border-primary-500/30 transition-colors h-full flex flex-col">
                                    <CardHeader>
                                        <div className="mb-4 p-4 rounded-xl bg-netral-900 w-fit">{item.icon}</div>
                                        <CardTitle className="text-netral-50 text-xl">{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-netral-400 text-base">{item.desc}</CardDescription>
                                    </CardContent>
                                </Card>
                            </MotionDiv>
                        ))}
                    </MotionDiv>
                </div>
            </section>

            {/* --- ALUR PENGADUAN --- */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <MotionDiv initial="hidden" whileInView="show" viewport={{ once: true }} variants={ANIM.container}>
                            <MotionH1 variants={ANIM.slideUp} className="text-3xl md:text-4xl font-bold text-netral-50 mb-6">
                                Alur Penanganan <br/> <span className="text-primary-400">Cepat & Transparan</span>
                            </MotionH1>
                            <MotionP variants={ANIM.slideUp} className="text-netral-400 mb-8">
                                Setiap laporan yang masuk akan melalui proses verifikasi ketat.
                            </MotionP>
                            
                            <div className="space-y-8">
                                {[
                                    { step: "01", title: "Verifikasi Laporan", desc: "Admin WBS memeriksa kelengkapan bukti awal (2-3 hari)." },
                                    { step: "02", title: "Penelaahan & Investigasi", desc: "Tim auditor melakukan audit investigatif jika bukti valid." },
                                    { step: "03", title: "Tindak Lanjut", desc: "Rekomendasi sanksi atau perbaikan diserahkan ke pimpinan." }
                                ].map((s, i) => (
                                    <MotionDiv key={i} variants={ANIM.slideRight} className="flex gap-6 group">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full border border-netral-700 flex items-center justify-center text-netral-500 font-mono font-bold group-hover:border-primary-500 group-hover:text-primary-400 transition-colors">
                                            {s.step}
                                        </div>
                                        <div>
                                            <h4 className="text-netral-50 font-bold mb-1 group-hover:text-primary-400 transition-colors">{s.title}</h4>
                                            <p className="text-sm text-netral-500">{s.desc}</p>
                                        </div>
                                    </MotionDiv>
                                ))}
                            </div>
                        </MotionDiv>

                        <MotionDiv 
                            initial={{ opacity: 0, scale: 0.8 }} 
                            whileInView={{ opacity: 1, scale: 1 }} 
                            transition={{ type: "spring", duration: 1 }}
                            className="relative h-[500px] rounded-3xl bg-gradient-to-br from-netral-900 to-netral-950 border border-netral-800 flex items-center justify-center"
                        >
                             {/* Floating Card UI Animation */}
                             <MotionDiv animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="relative z-10 text-center space-y-4 bg-netral-900/50 backdrop-blur-md p-8 rounded-2xl border border-netral-50/5 mx-6">
                                <div className="mx-auto w-20 h-20 bg-primary-900/30 rounded-full flex items-center justify-center border border-primary-500/30 text-primary-400 mb-4">
                                    <EyeOff size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-netral-50">100% Anonim</h3>
                                <div className="flex items-center justify-center gap-2 text-primary-400 text-xs font-mono bg-primary-950/50 py-1 px-3 rounded-full w-fit mx-auto">
                                    <CheckCircle2 size={12} />
                                    <span>ENCRYPTED: AES-256</span>
                                </div>
                             </MotionDiv>
                        </MotionDiv>
                    </div>
                </div>
            </section>

            {/* --- FAQ SECTION --- */}
            <section className="py-24 bg-netral-900 border-t border-netral-800">
                <div className="container mx-auto px-6 max-w-3xl">
                    <MotionDiv initial="hidden" whileInView="show" viewport={{ once: true }} variants={ANIM.slideUp} className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-netral-50">Pertanyaan Umum</h2>
                    </MotionDiv>
                    
                    <MotionDiv initial="hidden" whileInView="show" viewport={{ once: true }} variants={ANIM.container}>
                        <Accordion type="single" collapsible className="w-full">
                            {FAQS.map((faq, idx) => (
                                <MotionDiv key={idx} variants={ANIM.slideUp}>
                                    <AccordionItem value={`item-${idx}`} className="border-netral-800">
                                        <AccordionTrigger className="text-lg font-medium text-netral-50 hover:text-primary-400 hover:no-underline text-left">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-netral-400 leading-relaxed text-base">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                </MotionDiv>
                            ))}
                        </Accordion>
                    </MotionDiv>
                </div>
            </section>

            {/* --- CTA BOTTOM --- */}
            <section className="py-20 text-center">
                 <div className="container mx-auto px-6">
                    <MotionDiv initial="hidden" whileInView="show" viewport={{ once: true }} variants={ANIM.popIn} className="max-w-4xl mx-auto bg-gradient-to-r from-primary-900/40 to-secondary-900/40 border border-primary-500/30 p-12 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary-500/10 blur-[80px] rounded-full"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-netral-50 mb-6">Jangan Takut Melapor!</h2>
                            <p className="text-primary-100/70 mb-8 max-w-xl mx-auto">
                                Korupsi menghambat kemajuan daerah kita. Peran serta Anda sangat berarti.
                            </p>
                            <Button size="lg" onClick={() => setCreateOpen(true)} className="bg-netral-50 text-primary-950 hover:bg-primary-50 font-bold px-8 h-14 text-lg hover:scale-105 transition-transform">
                                <Send className="mr-2 w-5 h-5" /> Kirim Laporan Sekarang
                            </Button>
                        </div>
                    </MotionDiv>
                 </div>
            </section>

        </div>
    );
};

export default WBS;