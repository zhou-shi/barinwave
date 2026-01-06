import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
import { motion } from "framer-motion"; 
import { IslandProps } from "@/modules/types";
import { cn } from "@/modules/lib/utils";

// --- SHADCN IMPORTS (The Game Changer) ---
import { Button } from "@/modules/ui/shadcn/button";
import { Input } from "@/modules/ui/shadcn/input";
import { Label } from "@/modules/ui/shadcn/label";
import { Textarea } from "@/modules/ui/shadcn/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/modules/ui/shadcn/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/ui/shadcn/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/ui/shadcn/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/modules/ui/shadcn/accordion";

// --- ICONS ---
import { 
    ShieldCheck, Lock, FileWarning, EyeOff, 
    Send, Siren, Search, Paperclip
} from "lucide-react";

// --- ANIMATION VARIANTS (Page Level Only) ---
// Kita biarkan Dialog & Accordion menggunakan animasi bawaan Shadcn (Radix)
const ANIM = {
    container: {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
    },
    slideUp: {
        hidden: { y: 30, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } }
    }
};

const VIOLATIONS = [
    { title: "Korupsi & Suap", desc: "Penyalahgunaan anggaran, penerimaan suap, atau pemerasan.", icon: <Siren className="text-red-400" size={32} /> },
    { title: "Benturan Kepentingan", desc: "Pengambilan keputusan yang menguntungkan pribadi.", icon: <FileWarning className="text-amber-400" size={32} /> },
    { title: "Pelanggaran Disiplin", desc: "Pelanggaran kode etik ASN dan peraturan.", icon: <ShieldCheck className="text-emerald-400" size={32} /> }
];

const FAQS = [
    { question: "Apakah identitas saya aman?", answer: "Sangat aman. Inspektorat menjamin kerahasiaan identitas pelapor. Anda dapat melapor sebagai anonim." },
    { question: "Apa saja bukti yang perlu dilampirkan?", answer: "Foto, dokumen, rekaman suara, atau video yang menunjukkan indikasi pelanggaran." },
    { question: "Berapa lama laporan diproses?", answer: "Verifikasi maksimal 3 hari kerja. Investigasi maksimal 30 hari kerja." }
];

// --- SUB-COMPONENTS: FORMS ---

const ReportForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onSuccess(); // Tutup modal via callback
            alert("Laporan berhasil dikirim! Kode tiket Anda: WBS-2024-X99");
        }, 2000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
                <Label htmlFor="judul" className="text-netral-300">Judul Laporan</Label>
                <Input id="judul" required placeholder="Contoh: Dugaan Pungli di Dinas X" className="bg-netral-900 border-netral-700 focus-visible:ring-emerald-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-netral-300">Kategori</Label>
                    <Select>
                        <SelectTrigger className="bg-netral-900 border-netral-700">
                            <SelectValue placeholder="Pilih..." />
                        </SelectTrigger>
                        <SelectContent className="bg-netral-900 border-netral-800 text-white">
                            <SelectItem value="korupsi">Korupsi</SelectItem>
                            <SelectItem value="pungli">Pungli</SelectItem>
                            <SelectItem value="gratifikasi">Gratifikasi</SelectItem>
                            <SelectItem value="lainnya">Lainnya</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lokasi" className="text-netral-300">Lokasi Kejadian</Label>
                    <Input id="lokasi" placeholder="Nama Instansi/Daerah" className="bg-netral-900 border-netral-700 focus-visible:ring-emerald-500" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="isi" className="text-netral-300">Isi Laporan</Label>
                <Textarea id="isi" required rows={4} placeholder="Jelaskan detail kejadian (5W + 1H)..." className="bg-netral-900 border-netral-700 focus-visible:ring-emerald-500 resize-none" />
            </div>

            <div className="space-y-2">
                <Label className="text-netral-300">Bukti Lampiran</Label>
                <div className="border-2 border-dashed border-netral-700 rounded-lg p-6 text-center hover:border-emerald-500/50 hover:bg-netral-900/80 transition-all cursor-pointer">
                    <Paperclip className="mx-auto text-netral-500 mb-2" />
                    <span className="text-xs text-netral-400">Klik untuk upload dokumen/foto</span>
                </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 mt-2">
                {loading ? "Mengirim..." : "Kirim Laporan"}
            </Button>
        </form>
    );
};

const StatusForm = ({ onSuccess }: { onSuccess: () => void }) => {
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSuccess(); alert("Mencari data..."); }} className="space-y-6 py-4">
            <div className="text-center">
                <div className="w-16 h-16 bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                    <Search size={32} />
                </div>
                <p className="text-netral-400 text-sm">Masukkan Nomor Tiket atau Kode Registrasi yang Anda dapatkan saat melapor.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="ticket" className="text-netral-300">Nomor Tiket</Label>
                <Input id="ticket" required placeholder="WBS-2024-X99" className="bg-netral-900 border-netral-700 text-center font-mono text-lg uppercase tracking-widest h-12 focus-visible:ring-emerald-500" />
            </div>

            <Button type="submit" className="w-full bg-white text-emerald-950 hover:bg-emerald-50 font-bold h-12">
                Lacak Laporan
            </Button>
        </form>
    );
};

// --- MAIN PAGE ---
export const WBSPage = ({ Data }: IslandProps) => {
    // State untuk kontrol Dialog (Shadcn Dialog Controlled)
    const [createOpen, setCreateOpen] = useState(false);
    const [checkOpen, setCheckOpen] = useState(false);

    return (
        <div className="w-full overflow-hidden bg-[#0B0E14] min-h-screen pt-20">
            
            {/* --- MODAL DIALOGS (SHADCN) --- */}
            
            {/* 1. Modal Buat Laporan */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="bg-[#0f1219] border-netral-800 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Buat Laporan Baru</DialogTitle>
                        <DialogDescription className="text-netral-400">
                            Identitas Anda akan dienkripsi secara otomatis.
                        </DialogDescription>
                    </DialogHeader>
                    <ReportForm onSuccess={() => setCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* 2. Modal Cek Status */}
            <Dialog open={checkOpen} onOpenChange={setCheckOpen}>
                <DialogContent className="bg-[#0f1219] border-netral-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Lacak Status Laporan</DialogTitle>
                        <DialogDescription className="text-netral-400">
                            Pantau progres tindak lanjut laporan Anda.
                        </DialogDescription>
                    </DialogHeader>
                    <StatusForm onSuccess={() => setCheckOpen(false)} />
                </DialogContent>
            </Dialog>


            {/* --- HERO SECTION --- */}
            <section className="relative py-20 lg:py-32 px-6 container mx-auto text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-900/20 blur-[100px] rounded-full pointer-events-none" />
                
                <motion.div initial="hidden" animate="show" variants={ANIM.container} className="relative z-10 max-w-4xl mx-auto">
                    <motion.div variants={ANIM.slideUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-8">
                        <Lock size={14} /> Rahasia & Terenkripsi
                    </motion.div>
                    
                    <motion.h1 variants={ANIM.slideUp} className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Whistleblowing System <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">(WBS)</span>
                    </motion.h1>
                    
                    <motion.p variants={ANIM.slideUp} className="text-lg text-netral-400 mb-10 max-w-2xl mx-auto">
                        Saluran pelaporan resmi bagi masyarakat atau ASN untuk melaporkan indikasi tindak pidana korupsi dan pelanggaran.
                    </motion.p>

                    <motion.div variants={ANIM.slideUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button 
                            size="lg" 
                            onClick={() => setCreateOpen(true)}
                            className="rounded-full bg-emerald-600 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white border-0 transition-all hover:scale-105"
                        >
                            Buat Laporan Baru
                        </Button>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={() => setCheckOpen(true)}
                            className="rounded-full border-netral-700 text-white hover:bg-netral-800"
                        >
                            Cek Status Laporan
                        </Button>
                    </motion.div>
                </motion.div>
            </section>

            {/* --- KRITERIA PELAPORAN (SHADCN CARDS) --- */}
            <section className="py-20 border-t border-netral-800 bg-[#0f1219]">
                <div className="container mx-auto px-6">
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={ANIM.slideUp} className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Apa yang Bisa Dilaporkan?</h2>
                        <p className="text-netral-400">Lingkup pengaduan yang ditangani oleh Inspektorat Daerah.</p>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={ANIM.container} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {VIOLATIONS.map((item, idx) => (
                            <motion.div key={idx} variants={ANIM.slideUp} whileHover={{ y: -5 }}>
                                {/* SHADCN CARD */}
                                <Card className="bg-[#0B0E14] border-netral-800 hover:border-netral-600 transition-colors h-full">
                                    <CardHeader>
                                        <div className="mb-4 p-4 rounded-xl bg-netral-900 w-fit">{item.icon}</div>
                                        <CardTitle className="text-white text-xl">{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-netral-400 text-base">
                                            {item.desc}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- ALUR PENGADUAN --- */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={ANIM.slideUp}>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Alur Penanganan <br/> <span className="text-emerald-400">Cepat & Transparan</span></h2>
                            <p className="text-netral-400 mb-8 leading-relaxed">Setiap laporan yang masuk akan melalui proses verifikasi ketat. Kami memastikan setiap tahap dapat dipantau oleh pelapor menggunakan kode tiket unik.</p>
                            
                            <div className="space-y-8">
                                {[
                                    { step: "01", title: "Verifikasi Laporan", desc: "Admin WBS memeriksa kelengkapan bukti awal (2-3 hari)." },
                                    { step: "02", title: "Penelaahan & Investigasi", desc: "Tim auditor melakukan audit investigatif jika bukti valid." },
                                    { step: "03", title: "Tindak Lanjut", desc: "Rekomendasi sanksi atau perbaikan diserahkan ke pimpinan." }
                                ].map((s, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full border border-netral-700 flex items-center justify-center text-netral-500 font-mono font-bold group-hover:border-emerald-500 group-hover:text-emerald-400 transition-colors">{s.step}</div>
                                        <div><h4 className="text-white font-bold mb-1 group-hover:text-emerald-400 transition-colors">{s.title}</h4><p className="text-sm text-netral-500">{s.desc}</p></div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative h-[500px] rounded-3xl bg-gradient-to-br from-netral-900 to-black border border-netral-800 flex items-center justify-center overflow-hidden">
                             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                             <div className="absolute w-64 h-64 bg-emerald-600/20 blur-[80px] rounded-full animate-pulse"></div>
                             <div className="relative z-10 text-center space-y-4">
                                <div className="mx-auto w-20 h-20 bg-emerald-900/30 rounded-full flex items-center justify-center border border-emerald-500/30 text-emerald-400"><EyeOff size={40} /></div>
                                <h3 className="text-2xl font-bold text-white">100% Anonim</h3>
                                <p className="text-netral-400 max-w-xs mx-auto text-sm">Sistem kami mengenkripsi data pelapor. Anda dilindungi oleh Undang-Undang Perlindungan Saksi & Korban.</p>
                             </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- FAQ SECTION (SHADCN ACCORDION) --- */}
            <section className="py-24 bg-[#0f1219] border-t border-netral-800">
                <div className="container mx-auto px-6 max-w-3xl">
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={ANIM.slideUp} className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white">Pertanyaan Umum</h2>
                    </motion.div>
                    
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={ANIM.container}>
                        {/* SHADCN ACCORDION */}
                        <Accordion type="single" collapsible className="w-full">
                            {FAQS.map((faq, idx) => (
                                <AccordionItem key={idx} value={`item-${idx}`} className="border-netral-800">
                                    <AccordionTrigger className="text-lg font-medium text-white hover:text-emerald-400 hover:no-underline">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-netral-400 leading-relaxed text-base">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.div>
                </div>
            </section>

            {/* --- CTA BOTTOM --- */}
            <section className="py-20 text-center">
                 <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 p-12 rounded-3xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-white mb-6">Jangan Takut Melapor!</h2>
                            <p className="text-emerald-100/70 mb-8 max-w-xl mx-auto">Peran serta Anda sangat berarti untuk mewujudkan Kalimantan Barat yang bersih dari korupsi.</p>
                            <Button 
                                size="lg" 
                                onClick={() => setCreateOpen(true)}
                                className="bg-white text-emerald-950 hover:bg-emerald-50 font-bold px-8"
                            >
                                <Send className="mr-2 w-4 h-4" /> Kirim Laporan Sekarang
                            </Button>
                        </div>
                    </div>
                 </div>
            </section>
        </div>
    );
};

export default WBSPage;