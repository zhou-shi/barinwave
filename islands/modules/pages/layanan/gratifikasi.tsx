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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/ui/shadcn/tabs";

// --- ICONS ---
import { 
    Gift, Ban, CheckCircle2, XCircle, 
    FileText, CalendarDays, UploadCloud, HeartHandshake, Info, Search
} from "lucide-react";

// --- MAPPING MOTION ---
const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;
const MotionLi = motion.li;
const FormProvider = Form;

// --- TYPES & DATA ---

interface GratificationFormValues {
    namaPelapor: string;
    nip?: string;
    unitKerja: string;
    jenisPemberian: string;
    estimasiNilai: string;
    namaPemberi: string;
    hubungan: string;
    tanggalPenerimaan: string;
    keterangan: string;
}

const WAJIB_LAPOR = [
    "Uang tunai, voucher belanja, atau pulsa.",
    "Tiket perjalanan, akomodasi hotel, atau paket liburan.",
    "Diskon khusus yang tidak berlaku untuk umum.",
    "Pinjaman tanpa bunga dari rekanan.",
    "Pengobatan cuma-cuma dari pihak yang berkepentingan."
];

const TIDAK_WAJIB = [
    "Hadiah seminar (seminar kit) yang berlaku umum.",
    "Kompensasi resmi dari kedinasan (honorarium legal).",
    "Hadiah keluarga (selama tidak ada benturan kepentingan).",
    "Hidangan/sajian yang berlaku umum dalam rapat.",
    "Keuntungan koperasi atau undian yang terbuka untuk umum."
];


// --- COMPONENT: FORM LAPOR GRATIFIKASI ---
const GratificationForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const form = useForm<GratificationFormValues>();
    const { isSubmitting } = form.formState;

    const onSubmit = async (data: GratificationFormValues) => {
        // Simulasi API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("Data Gratifikasi:", data);
        onSuccess();
        alert("Laporan Gratifikasi Berhasil Disimpan! Menunggu verifikasi UPG.");
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <MotionDiv initial="hidden" animate="show" variants={ANIM.container} className="space-y-4">
                    
                    {/* SECTION 1: DATA PELAPOR */}
                    <div className="space-y-3 p-4 rounded-lg bg-netral-900/50 border border-netral-800">
                        {/* Menggunakan SECONDARY untuk Identitas (sesuai logika Kalbarprov: Amber/Netral) */}
                        <h4 className="text-sm font-bold text-secondary-500 flex items-center gap-2">
                            <CheckCircle2 size={14}/> Identitas Pelapor (ASN/Penyelenggara)
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <MotionDiv variants={ANIM.slideUp}>
                                <FormField
                                    control={form.control}
                                    name="namaPelapor"
                                    rules={{ required: "Nama wajib diisi" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-netral-400">Nama Lengkap</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nama Anda" className="bg-netral-950 border-netral-700 h-9 text-sm focus-visible:ring-primary-500" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-xs text-tertiary-500" />
                                        </FormItem>
                                    )}
                                />
                            </MotionDiv>
                            <MotionDiv variants={ANIM.slideUp}>
                                <FormField
                                    control={form.control}
                                    name="nip"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-netral-400">NIP / NIK (Opsional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="199xxxxx" className="bg-netral-950 border-netral-700 h-9 text-sm focus-visible:ring-primary-500" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </MotionDiv>
                        </div>
                        <MotionDiv variants={ANIM.slideUp}>
                            <FormField
                                control={form.control}
                                name="unitKerja"
                                rules={{ required: "Unit kerja wajib diisi" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-netral-400">Unit Kerja / Instansi</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Dinas..." className="bg-netral-950 border-netral-700 h-9 text-sm focus-visible:ring-primary-500" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-xs text-tertiary-500" />
                                    </FormItem>
                                )}
                            />
                        </MotionDiv>
                    </div>

                    {/* SECTION 2: DATA PEMBERIAN */}
                    <div className="space-y-3 p-4 rounded-lg bg-netral-900/50 border border-netral-800">
                        {/* Menggunakan PRIMARY untuk Objek Utama (Gratifikasi) */}
                        <h4 className="text-sm font-bold text-primary-400 flex items-center gap-2">
                            <Gift size={14}/> Detail Penerimaan
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <MotionDiv variants={ANIM.slideUp}>
                                <FormField
                                    control={form.control}
                                    name="jenisPemberian"
                                    rules={{ required: "Pilih jenis" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-netral-400">Bentuk</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-netral-950 border-netral-700 h-9 text-sm focus:ring-primary-500">
                                                        <SelectValue placeholder="Pilih..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-netral-900 border-netral-800 text-netral-50">
                                                    <SelectItem value="uang">Uang Tunai/Transfer</SelectItem>
                                                    <SelectItem value="barang">Barang/Makanan</SelectItem>
                                                    <SelectItem value="rabat">Diskon/Rabat</SelectItem>
                                                    <SelectItem value="fasilitas">Fasilitas/Tiket</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-xs text-tertiary-500" />
                                        </FormItem>
                                    )}
                                />
                            </MotionDiv>
                            <MotionDiv variants={ANIM.slideUp}>
                                <FormField
                                    control={form.control}
                                    name="estimasiNilai"
                                    rules={{ required: "Estimasi nilai wajib diisi" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-netral-400">Estimasi Nilai (Rp)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0" className="bg-netral-950 border-netral-700 h-9 text-sm focus-visible:ring-primary-500" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-xs text-tertiary-500" />
                                        </FormItem>
                                    )}
                                />
                            </MotionDiv>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <MotionDiv variants={ANIM.slideUp}>
                                <FormField
                                    control={form.control}
                                    name="namaPemberi"
                                    rules={{ required: "Nama pemberi wajib diisi" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-netral-400">Nama Pemberi</FormLabel>
                                            <FormControl>
                                                <Input placeholder="PT / Individu" className="bg-netral-950 border-netral-700 h-9 text-sm focus-visible:ring-primary-500" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-xs text-tertiary-500" />
                                        </FormItem>
                                    )}
                                />
                            </MotionDiv>
                            <MotionDiv variants={ANIM.slideUp}>
                                <FormField
                                    control={form.control}
                                    name="tanggalPenerimaan"
                                    rules={{ required: "Tanggal wajib diisi" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-netral-400">Tanggal Terima</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input type="date" className="bg-netral-950 border-netral-700 h-9 text-sm pl-9 focus-visible:ring-primary-500" {...field} />
                                                    <CalendarDays className="absolute left-2.5 top-2.5 text-netral-500 w-4 h-4" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs text-tertiary-500" />
                                        </FormItem>
                                    )}
                                />
                            </MotionDiv>
                        </div>

                        <MotionDiv variants={ANIM.slideUp}>
                             <FormField
                                control={form.control}
                                name="keterangan"
                                rules={{ required: "Jelaskan kronologi" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-netral-400">Kronologi / Dalam Rangka Apa?</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Contoh: Diberikan setelah rapat evaluasi proyek..." className="bg-netral-950 border-netral-700 h-20 text-sm resize-none focus-visible:ring-primary-500" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-xs text-tertiary-500" />
                                    </FormItem>
                                )}
                            />
                        </MotionDiv>
                        
                        {/* FAKE UPLOAD */}
                        <MotionDiv variants={ANIM.slideUp}>
                             <div className="border border-dashed border-netral-700 rounded bg-netral-950/50 p-4 text-center cursor-pointer hover:bg-netral-900 transition-colors group">
                                <UploadCloud className="mx-auto text-netral-500 mb-2 group-hover:text-primary-500 transition-colors" size={20}/>
                                <p className="text-xs text-netral-400">Klik untuk upload bukti foto barang/uang (Max 2MB)</p>
                             </div>
                        </MotionDiv>
                    </div>

                    <MotionDiv variants={ANIM.slideUp}>
                        {/* Tombol Menggunakan Primary Color */}
                        <Button type="submit" disabled={isSubmitting} className="w-full bg-primary-600 hover:bg-primary-500 text-netral-50 font-bold h-10 mt-2">
                            {isSubmitting ? "Mengirim..." : "Kirim Laporan ke UPG"}
                        </Button>
                    </MotionDiv>

                </MotionDiv>
            </form>
        </FormProvider>
    );
};

export const config: ConfigIsland = {mode: "interactive", build: false};

// ---  COMPONENT ---
export const Gratifikasi = ({ Data }: IslandProps) => {
    const [openModal, setOpenModal] = useState(false);

    return (
        // Menggunakan bg-netral-950 agar konsisten dengan tema gelap di main.css
        <div className="w-full overflow-hidden bg-netral-950 min-h-screen pt-20">
            
            {/* --- MODAL FORM --- */}
            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent className="bg-netral-900 border-netral-800 text-netral-50 sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl text-primary-500">
                            <Gift size={24}/> 
                            Formulir Pelaporan Gratifikasi
                        </DialogTitle>
                        <DialogDescription className="text-netral-400">
                            Wajib dilaporkan maksimal <strong>30 Hari Kerja</strong> sejak penerimaan.
                        </DialogDescription>
                    </DialogHeader>
                    <GratificationForm onSuccess={() => setOpenModal(false)} />
                </DialogContent>
            </Dialog>


            {/* --- HERO SECTION --- */}
            <section className="relative py-24 px-6 container mx-auto text-center overflow-hidden">
                {/* Background Decor menggunakan variabel tema */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-900/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-900/10 blur-[100px] rounded-full pointer-events-none" />

                <MotionDiv initial="hidden" animate="show" variants={ANIM.container} className="relative z-10 max-w-4xl mx-auto">
                    {/* Badge: Menggunakan Primary Alpha */}
                    <MotionDiv variants={ANIM.slideUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-900/30 border border-primary-500/30 text-primary-400 text-sm font-medium mb-8">
                        <HeartHandshake size={16} /> Unit Pengendali Gratifikasi (UPG)
                    </MotionDiv>
                    
                    <MotionH1 variants={ANIM.slideUp} className="text-4xl md:text-6xl font-bold text-netral-50 mb-6 leading-tight">
                        Berani <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Tolak</span>, <br/>
                        Wajib <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 to-primary-400">Lapor</span>.
                    </MotionH1>
                    
                    <MotionP variants={ANIM.slideUp} className="text-lg text-netral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Penerimaan hadiah terkait jabatan adalah Gratifikasi. 
                        Laporkan penerimaan apapun demi menjaga integritas dan netralitas ASN di lingkungan Pemerintah Provinsi.
                    </MotionP>

                    <MotionDiv variants={ANIM.slideUp}>
                        {/* Tombol Utama Hero */}
                        <Button size="lg" onClick={() => setOpenModal(true)} className="rounded-full bg-primary-600 hover:bg-primary-500 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary-500),transparent_60%)] text-netral-50 border-0 transition-all hover:scale-105 h-14 px-8 text-lg font-bold">
                            <FileText className="w-5 h-5 mr-2" /> Isi Formulir Laporan
                        </Button>
                    </MotionDiv>
                </MotionDiv>
            </section>

            {/* --- EDUKASI: TABS --- */}
            <section className="py-20 bg-netral-900 border-y border-netral-800">
                <div className="container mx-auto px-6 max-w-5xl">
                    <MotionDiv initial="hidden" whileInView="show" viewport={{ once: true }} variants={ANIM.slideUp} className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-netral-50 mb-4">Kenali Gratifikasi</h2>
                        <p className="text-netral-400">Tidak semua pemberian itu dilarang. Pahami bedanya.</p>
                    </MotionDiv>

                    <MotionDiv initial="hidden" whileInView="show" viewport={{ once: true }} variants={ANIM.popIn}>
                        <Tabs defaultValue="wajib" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-netral-950 border border-netral-800 h-14 p-1 rounded-xl mb-8">
                                {/* LOGIKA WARNA TAB:
                                    - Wajib Lapor (Ilegal) -> TERTIARY (Biasanya Merah/Amber - Danger/Warning)
                                    - Boleh (Legal) -> PRIMARY (Biasanya Hijau/Ungu/Biru - Safe/Brand)
                                */}
                                <TabsTrigger value="wajib" className="data-[state=active]:bg-tertiary-600 data-[state=active]:text-netral-50 text-netral-400 h-full rounded-lg text-base font-medium transition-all">
                                    <Ban className="w-4 h-4 mr-2" /> Wajib Dilaporkan (Ilegal)
                                </TabsTrigger>
                                <TabsTrigger value="tidak-wajib" className="data-[state=active]:bg-primary-600 data-[state=active]:text-netral-50 text-netral-400 h-full rounded-lg text-base font-medium transition-all">
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Boleh Diterima (Legal)
                                </TabsTrigger>
                            </TabsList>
                            
                            {/* TAB 1: WAJIB LAPOR (Menggunakan aksen Tertiary - Danger/Warning) */}
                            <TabsContent value="wajib" className="mt-0">
                                <Card className="bg-netral-900/50 border-tertiary-500/30">
                                    <CardHeader>
                                        <CardTitle className="text-tertiary-400 text-xl flex items-center gap-2">
                                            <XCircle /> Gratifikasi yang Dianggap Suap
                                        </CardTitle>
                                        <CardDescription className="text-netral-400">
                                            Pemberian yang berkaitan dengan jabatan dan berlawanan dengan kewajiban atau tugasnya.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {WAJIB_LAPOR.map((item, idx) => (
                                                <MotionLi 
                                                    key={idx} 
                                                    variants={ANIM.slideRight} 
                                                    initial="hidden" 
                                                    whileInView="show" 
                                                    className="flex items-start gap-3 text-netral-300 bg-netral-950/40 p-4 rounded-lg border border-netral-800 hover:border-tertiary-500/50 transition-colors"
                                                >
                                                    <div className="mt-1 w-2 h-2 rounded-full bg-tertiary-500 flex-shrink-0" />
                                                    <span>{item}</span>
                                                </MotionLi>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* TAB 2: TIDAK WAJIB LAPOR (Menggunakan aksen Primary - Safe) */}
                            <TabsContent value="tidak-wajib" className="mt-0">
                                <Card className="bg-netral-900/50 border-primary-500/30">
                                    <CardHeader>
                                        <CardTitle className="text-primary-400 text-xl flex items-center gap-2">
                                            <CheckCircle2 /> Gratifikasi yang Tidak Wajib Lapor
                                        </CardTitle>
                                        <CardDescription className="text-netral-400">
                                            Pemberian yang berlaku umum, dalam ranah adat/kekerabatan, dan tidak mengandung konflik kepentingan.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {TIDAK_WAJIB.map((item, idx) => (
                                                <MotionLi 
                                                    key={idx} 
                                                    variants={ANIM.slideRight} 
                                                    initial="hidden" 
                                                    whileInView="show" 
                                                    className="flex items-start gap-3 text-netral-300 bg-netral-950/40 p-4 rounded-lg border border-netral-800 hover:border-primary-500/50 transition-colors"
                                                >
                                                    <div className="mt-1 w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                                                    <span>{item}</span>
                                                </MotionLi>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </MotionDiv>
                </div>
            </section>

            {/* --- ALUR PELAPORAN --- */}
            <section className="py-24 px-6 container mx-auto">
                 <MotionDiv initial="hidden" whileInView="show" viewport={{ once: true }} variants={ANIM.slideUp} className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-netral-50 mb-4">Mekanisme Pelaporan</h2>
                    <p className="text-netral-400">Proses penanganan laporan gratifikasi yang transparan.</p>
                </MotionDiv>

                <MotionDiv initial="hidden" whileInView="show" viewport={{ once: true }} variants={ANIM.container} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { step: "01", title: "Lapor", desc: "Penerima melaporkan maksimal 30 hari kerja setelah menerima.", icon: <FileText size={28}/> },
                        { step: "02", title: "Verifikasi", desc: "UPG memeriksa kelengkapan dokumen dan bukti.", icon: <Info size={28}/> },
                        { step: "03", title: "Analisis", desc: "KPK/UPG menetapkan status barang (Milik Negara/Pribadi).", icon: <Search size={28}/> },
                        { step: "04", title: "Penetapan", desc: "SK Penetapan Status Gratifikasi diterbitkan.", icon: <CheckCircle2 size={28}/> }
                    ].map((item, idx) => (
                        <MotionDiv key={idx} variants={ANIM.popIn} className="bg-gradient-to-br from-netral-900 to-netral-950 p-8 rounded-2xl border border-netral-800 relative group overflow-hidden hover:border-primary-500/30 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-netral-50 group-hover:opacity-20 transition-opacity">{item.step}</div>
                            {/* Icon Background menggunakan Primary */}
                            <div className="w-14 h-14 bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-400 mb-6 group-hover:scale-110 transition-transform duration-300 border border-primary-500/20">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-netral-50 mb-2">{item.title}</h3>
                            <p className="text-sm text-netral-400 leading-relaxed">{item.desc}</p>
                        </MotionDiv>
                    ))}
                </MotionDiv>
            </section>

        </div>
    );
};

export default Gratifikasi;