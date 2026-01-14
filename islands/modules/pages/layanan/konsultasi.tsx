import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ConfigIsland, IslandProps } from "@/modules/types";

// --- IMPORT ANIMASI TERPUSAT ---
import { ANIM } from "@/modules/lib/motion";

// --- SHADCN COMPONENTS ---
import { Button } from "@/modules/ui/shadcn/button";
import { Input } from "@/modules/ui/shadcn/input";
import { Textarea } from "@/modules/ui/shadcn/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/modules/ui/shadcn/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  RadioGroup,
  RadioGroupItem
} from "@/modules/ui/shadcn/radio-group";

// --- ICONS ---
import { 
    Users, CalendarCheck, Video, MapPin, 
    BookOpen, Scale, TrendingUp, HelpCircle, 
    MessageSquare, CheckCircle2, MonitorPlay
} from "lucide-react";

// --- MAPPING MOTION ---
const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;
const FormProvider = Form;

// --- DATA ---
const TOPICS = [
    { title: "Pengelolaan Keuangan", desc: "Konsultasi SIPD, penatausahaan, dan pertanggungjawaban anggaran.", icon: <TrendingUp size={24}/> },
    { title: "Manajemen Aset (BMD)", desc: "Penghapusan, pemindahtanganan, dan inventarisasi aset daerah.", icon: <BookOpen size={24}/> },
    { title: "Produk Hukum", desc: "Reviu Perkada, Perda, dan analisis risiko hukum kebijakan.", icon: <Scale size={24}/> },
    { title: "Probity Audit", desc: "Pendampingan proyek strategis daerah agar tepat mutu & waktu.", icon: <CheckCircle2 size={24}/> }
];

// --- TYPES ---
interface ConsultationFormValues {
    nama: string;
    instansi: string;
    jabatan: string;
    kontak: string; // WA/Email
    topik: string;
    metode: "online" | "offline";
    tanggal: string;
    permasalahan: string;
}

// --- FORM COMPONENT ---
const ConsultationForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const form = useForm<ConsultationFormValues>({
        defaultValues: {
            metode: "offline"
        }
    });
    const { isSubmitting } = form.formState;

    const onSubmit = async (data: ConsultationFormValues) => {
        // Simulasi API Request
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("Booking Konsultasi:", data);
        onSuccess();
        alert("Permintaan Jadwal Terkirim! Admin akan mengonfirmasi via WhatsApp.");
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-2">
                <MotionDiv initial="hidden" animate="show" variants={ANIM.container} className="space-y-4">
                    
                    {/* SECTION 1: DATA PEMOHON */}
                    <div className="p-4 rounded-lg bg-netral-950/50 border border-netral-800 space-y-4">
                        <h4 className="text-sm font-bold text-primary-400 flex items-center gap-2">
                            <Users size={16}/> Data Pemohon
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <MotionDiv variants={ANIM.slideUp}>
                                <FormField control={form.control} name="nama" rules={{ required: "Wajib diisi" }} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-netral-400">Nama Lengkap</FormLabel>
                                        <FormControl><Input placeholder="Nama Anda" className="bg-netral-900 border-netral-700 h-9 text-sm focus-visible:ring-primary-500" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                            </MotionDiv>
                            <MotionDiv variants={ANIM.slideUp}>
                                <FormField control={form.control} name="kontak" rules={{ required: "Wajib diisi" }} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-netral-400">No. WhatsApp</FormLabel>
                                        <FormControl><Input placeholder="08xxxxx" type="tel" className="bg-netral-900 border-netral-700 h-9 text-sm focus-visible:ring-primary-500" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                            </MotionDiv>
                        </div>
                        <MotionDiv variants={ANIM.slideUp}>
                            <FormField control={form.control} name="instansi" rules={{ required: "Wajib diisi" }} render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-netral-400">Instansi / Perangkat Daerah</FormLabel>
                                    <FormControl><Input placeholder="Dinas..." className="bg-netral-900 border-netral-700 h-9 text-sm focus-visible:ring-primary-500" {...field} /></FormControl>
                                </FormItem>
                            )} />
                        </MotionDiv>
                    </div>

                    {/* SECTION 2: DETAIL KONSULTASI */}
                    <div className="p-4 rounded-lg bg-netral-950/50 border border-netral-800 space-y-4">
                        <h4 className="text-sm font-bold text-secondary-400 flex items-center gap-2">
                            <MessageSquare size={16}/> Detail Konsultasi
                        </h4>

                        <MotionDiv variants={ANIM.slideUp}>
                            <FormField control={form.control} name="topik" rules={{ required: "Pilih topik" }} render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-netral-400">Topik Pembahasan</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-netral-900 border-netral-700 h-9 text-sm focus:ring-primary-500">
                                                <SelectValue placeholder="Pilih topik..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-netral-900 border-netral-800 text-netral-50">
                                            {TOPICS.map((t, i) => (
                                                <SelectItem key={i} value={t.title}>{t.title}</SelectItem>
                                            ))}
                                            <SelectItem value="lainnya">Lainnya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                        </MotionDiv>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <MotionDiv variants={ANIM.slideUp}>
                                <FormField control={form.control} name="tanggal" rules={{ required: "Wajib diisi" }} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-netral-400">Rencana Tanggal</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input type="date" className="bg-netral-900 border-netral-700 h-9 text-sm pl-9 focus-visible:ring-primary-500" {...field} />
                                                <CalendarCheck className="absolute left-2.5 top-2.5 text-netral-500 w-4 h-4" />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </MotionDiv>

                            <MotionDiv variants={ANIM.slideUp}>
                                <FormField control={form.control} name="metode" render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-xs text-netral-400">Metode Pertemuan</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="offline" className="border-primary-500 text-primary-500" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal text-sm cursor-pointer flex items-center gap-2">
                                                        <MapPin size={14} className="text-primary-400"/> Tatap Muka (Kantor)
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="online" className="border-primary-500 text-primary-500" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal text-sm cursor-pointer flex items-center gap-2">
                                                        <Video size={14} className="text-secondary-400"/> Zoom Meeting
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </MotionDiv>
                        </div>

                        <MotionDiv variants={ANIM.slideUp}>
                             <FormField control={form.control} name="permasalahan" rules={{ required: "Jelaskan singkat" }} render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-netral-400">Deskripsi Permasalahan Singkat</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Mohon jelaskan poin yang ingin dikonsultasikan..." className="bg-netral-900 border-netral-700 h-20 text-sm resize-none focus-visible:ring-primary-500" {...field} />
                                    </FormControl>
                                </FormItem>
                            )} />
                        </MotionDiv>
                    </div>

                    <MotionDiv variants={ANIM.slideUp}>
                        <Button type="submit" disabled={isSubmitting} className="w-full bg-primary-600 hover:bg-primary-500 text-netral-50 font-bold h-10 mt-2">
                            {isSubmitting ? "Sedang Booking..." : "Ajukan Jadwal Konsultasi"}
                        </Button>
                    </MotionDiv>

                </MotionDiv>
            </form>
        </FormProvider>
    );
};

export const config: ConfigIsland = {mode: "interactive", build: false};

// --- MAIN PAGE ---
export const Konsultasi = ({ Data }: IslandProps) => {
    const [openModal, setOpenModal] = useState(false);

    return (
        <div className="w-full overflow-hidden bg-netral-950 min-h-screen pt-20">
            
            {/* --- MODAL --- */}
            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent className="bg-netral-900 border-netral-800 text-netral-50 sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl text-primary-500">
                            <CalendarCheck size={24}/> 
                            Formulir Booking Konsultasi
                        </DialogTitle>
                        <DialogDescription className="text-netral-400">
                            Jadwal akan dikonfirmasi oleh admin melalui WhatsApp dalam 1x24 jam.
                        </DialogDescription>
                    </DialogHeader>
                    <ConsultationForm onSuccess={() => setOpenModal(false)} />
                </DialogContent>
            </Dialog>

            {/* --- HERO SECTION --- */}
            <section className="relative py-24 px-6 container mx-auto text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-secondary-900/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary-900/10 blur-[100px] rounded-full pointer-events-none" />

                <MotionDiv initial="hidden" animate="show" variants={ANIM.container} className="relative z-10 max-w-4xl mx-auto">
                    <MotionDiv variants={ANIM.slideUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-netral-900 border border-netral-800 text-secondary-400 text-sm font-medium mb-8">
                        <HelpCircle size={16} /> Klinik Konsultasi Pengawasan
                    </MotionDiv>
                    
                    <MotionH1 variants={ANIM.slideUp} className="text-4xl md:text-6xl font-bold text-netral-50 mb-6 leading-tight">
                        Cegah Masalah, <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Tingkatkan Kualitas.</span>
                    </MotionH1>
                    
                    <MotionP variants={ANIM.slideUp} className="text-lg text-netral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Jangan menunggu menjadi temuan. Diskusikan keraguan Anda terkait regulasi, pengelolaan keuangan, dan aset bersama Auditor kami.
                    </MotionP>

                    <MotionDiv variants={ANIM.slideUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" onClick={() => setOpenModal(true)} className="rounded-full bg-primary-600 hover:bg-primary-500 text-netral-50 border-0 transition-all hover:scale-105 h-14 px-8 text-lg font-bold shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary-500),transparent_70%)]">
                            <CalendarCheck className="w-5 h-5 mr-2" /> Booking Jadwal
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-full border-netral-700 text-netral-50 hover:bg-netral-800 h-14 px-8 text-lg">
                            <MonitorPlay className="w-5 h-5 mr-2" /> Video Panduan
                        </Button>
                    </MotionDiv>
                </MotionDiv>
            </section>

            {/* --- TOPICS GRID --- */}
            <section className="py-20 bg-netral-900 border-y border-netral-800">
                <div className="container mx-auto px-6">
                    <MotionDiv initial="hidden" whileInView="show" viewport={{ once: true }} variants={ANIM.slideUp} className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-netral-50 mb-4">Ruang Lingkup Konsultasi</h2>
                        <p className="text-netral-400">Bidang keahlian yang siap kami bantu.</p>
                    </MotionDiv>

                    <MotionDiv 
                        initial="hidden" 
                        whileInView="show" 
                        viewport={{ once: true }} 
                        variants={ANIM.container} 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {TOPICS.map((item, idx) => (
                            <MotionDiv key={idx} variants={ANIM.popIn} className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <Card className="bg-netral-950 border-netral-800 hover:border-primary-500/50 transition-all duration-300 h-full relative z-10">
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-netral-900 rounded-lg flex items-center justify-center text-primary-400 mb-2 group-hover:scale-110 transition-transform duration-300 border border-netral-800 group-hover:border-primary-500/30">
                                            {item.icon}
                                        </div>
                                        <CardTitle className="text-netral-50 text-lg">{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-netral-400 leading-relaxed">
                                            {item.desc}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </MotionDiv>
                        ))}
                    </MotionDiv>
                </div>
            </section>

            {/* --- FLOW SECTION --- */}
            <section className="py-24 px-6 container mx-auto">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <MotionDiv initial="hidden" whileInView="show" viewport={{ once: true }} variants={ANIM.container}>
                        <MotionH1 variants={ANIM.slideUp} className="text-3xl font-bold text-netral-50 mb-6">
                            Mudah & Fleksibel <br/>
                            <span className="text-secondary-400">Online maupun Offline</span>
                        </MotionH1>
                        <MotionP variants={ANIM.slideUp} className="text-netral-400 mb-8 leading-relaxed">
                            Kami menyediakan layanan konsultasi dua arah. Anda dapat datang langsung ke Klinik Konsultasi di kantor kami, atau melakukan video conference jika terkendala jarak.
                        </MotionP>

                        <div className="space-y-6">
                            {[
                                { title: "Registrasi Online", desc: "Isi formulir booking pada halaman ini.", icon: "01" },
                                { title: "Verifikasi Jadwal", desc: "Admin menyesuaikan jadwal dengan Auditor terkait.", icon: "02" },
                                { title: "Pelaksanaan", desc: "Konsultasi berjalan (maksimal 60 menit per sesi).", icon: "03" },
                                { title: "Notulensi", desc: "Hasil konsultasi dicatat sebagai rekomendasi resmi.", icon: "04" },
                            ].map((step, i) => (
                                <MotionDiv key={i} variants={ANIM.slideRight} className="flex gap-4 items-start">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full border border-primary-500/30 bg-primary-900/10 flex items-center justify-center text-primary-400 font-mono font-bold text-sm">
                                        {step.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-netral-50 font-bold">{step.title}</h4>
                                        <p className="text-sm text-netral-400">{step.desc}</p>
                                    </div>
                                </MotionDiv>
                            ))}
                        </div>
                    </MotionDiv>

                    <MotionDiv 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        whileInView={{ opacity: 1, scale: 1 }} 
                        transition={{ duration: 0.8 }}
                        className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden border border-netral-800 bg-netral-900 flex items-center justify-center group"
                    >
                        {/* Abstract Representation of Meeting */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/20 to-secondary-900/20 opacity-50" />
                        
                        {/* Cards Floating */}
                        <MotionDiv 
                            animate={{ y: [-10, 10, -10] }} 
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-10 bg-netral-950/80 backdrop-blur-md border border-netral-700 p-6 rounded-2xl shadow-2xl max-w-xs"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                                    <Video size={20} />
                                </div>
                                <div>
                                    <div className="h-2 w-24 bg-netral-700 rounded mb-1" />
                                    <div className="h-2 w-16 bg-netral-800 rounded" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 w-full bg-netral-800 rounded" />
                                <div className="h-2 w-full bg-netral-800 rounded" />
                                <div className="h-2 w-2/3 bg-netral-800 rounded" />
                            </div>
                            <div className="mt-4 flex gap-2">
                                <div className="h-8 w-full bg-primary-600/20 rounded border border-primary-500/30" />
                            </div>
                        </MotionDiv>

                        <div className="absolute bottom-10 right-10 flex gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                             <span className="text-xs font-mono text-netral-500">LIVE SESSION</span>
                        </div>
                    </MotionDiv>
                 </div>
            </section>

        </div>
    );
};

export default Konsultasi;