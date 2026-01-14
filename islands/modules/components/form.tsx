import { useState } from "react"; // [FIX] Gunakan 'react' agar selaras dengan react-hook-form
import { useForm } from "react-hook-form";
import { ConfigIsland, IslandProps } from "@/modules/types";
import { cn } from "@/modules/lib/utils";
import { createClient } from "@supabase/supabase-js";

// --- UI IMPORTS ---
import { Button } from "@/modules/ui/shadcn/button";
import { Input } from "@/modules/ui/shadcn/input";
import { Textarea } from "@/modules/ui/shadcn/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/ui/shadcn/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/modules/ui/shadcn/form";
import { RadioGroup, RadioGroupItem } from "@/modules/ui/shadcn/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/modules/ui/shadcn/alert"; // [FIX] Import Alert
import { CalendarDays, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"; // Import Icons
import { ANIM, MotionDiv } from "@/modules/lib/motion";
import { safeEntry } from "../lib/safe";

const FormProvider = Form;

// [BARU] Helper untuk membaca ENV dari berbagai sumber
const getEnv = (key: string) => {
    // 1. Coba baca dari Window Injection (Browser Runtime)
    if (typeof window !== 'undefined' && (window as any).__BRAINWAVE_ENV__) {
        return (window as any).__BRAINWAVE_ENV__[key];
    }
    // 2. Coba baca dari Build Define (Fallback / Server Side)
    // Gunakan try-catch agar tidak error jika import.meta tidak didefinisikan
    try {
        return import.meta.env[key];
    } catch (e) {
        return undefined;
    }
};

// --- INIT SUPABASE ---
const supabaseUrl = getEnv("VITE_SUPABASE_URL");
const supabaseKey = getEnv("VITE_SUPABASE_ANON_KEY");

// Debugging di Console Browser
if (typeof window !== 'undefined') {
    console.log("Supabase Connection:", { 
        url: supabaseUrl ? "OK ✅" : "MISSING ❌", 
        key: supabaseKey ? "OK ✅" : "MISSING ❌" 
    });
}

const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey) 
    : null;

// ==========================================
// 1️⃣ TYPE DEFINITIONS (SCHEMA)
// ==========================================

export type FieldType = "text" | "number" | "email" | "tel" | "date" | "textarea" | "select" | "radio";

export type FormFieldConfig = {
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: string }[];
    width?: "full" | "half";
    className?: string;
}

export type SupabaseConfig = {
    table: string;
    successMessage?: string;
    errorMessage?: string;
}

export type FormConfig = {
    // variant: string;
    title?: string;
    description?: string;
    submitText?: string;
    fields?: FormFieldConfig[];
    supabase?: SupabaseConfig;
}

// ==========================================
// 2️⃣ DEFAULT PRESETS
// ==========================================

const DEFAULT_PARAMS: Omit<FormConfig, "variant"> = {
    title: "Formulir Dinamis",
    description: "Isi formulir di bawah ini dan kirimkan data Anda.",
    submitText: "Kirim Data",
    fields: [
        { name: "nama", label: "Nama Lengkap", type: "text", placeholder: "Masukkan nama lengkap Anda", required: true, width: "full" },
        { name: "email", label: "Email", type: "email", placeholder: "Masukkan email Anda", required: true, width: "full" },
        { name: "pesan", label: "Pesan", type: "textarea", placeholder: "Tulis pesan Anda di sini...", required: false, width: "full" },
        { name: "kategori", label: "Kategori", type: "select", required: true, width: "half", options: [
            { label: "Umum", value: "umum" },
            { label: "Masalah Teknis", value: "teknis" },
            { label: "Saran", value: "saran" }
        ]},
        { name: "prioritas", label: "Prioritas", type: "radio", required: true, width: "half", options: [
            { label: "Rendah", value: "rendah" },
            { label: "Sedang", value: "sedang" },
            { label: "Tinggi", value: "tinggi" }
        ]}
    ]
};

// ==========================================
// 3️⃣ DYNAMIC FIELD RENDERER
// ==========================================

const FieldRenderer = ({ field, formControl }: { field: FormFieldConfig, formControl: any }) => {
    return (
        <FormField
            control={formControl}
            name={field.name}
            rules={{ required: field.required ? `${field.label} wajib diisi` : false }}
            render={({ field: formField }) => (
                <FormItem className={cn(field.width === "half" ? "col-span-1" : "col-span-2")}>
                    <FormLabel className="text-netral-300">{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                    <FormControl>
                        {(() => {
                            switch (field.type) {
                                case "textarea":
                                    return <Textarea placeholder={field.placeholder} className="bg-netral-950 border-netral-700 min-h-[100px]" {...formField} />;
                                case "select":
                                    return (
                                        <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-netral-950 border-netral-700">
                                                    <SelectValue placeholder="Pilih..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-netral-900 border-netral-800 text-netral-50">
                                                {field.options?.map((opt, idx) => (
                                                    <SelectItem key={idx} value={opt.value}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    );
                                case "radio":
                                    return (
                                        <RadioGroup onValueChange={formField.onChange} defaultValue={formField.value} className="flex gap-4">
                                            {field.options?.map((opt, idx) => (
                                                <div key={idx} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={opt.value} id={`${field.name}-${idx}`} className="border-primary-500 text-primary-500"/>
                                                    <label htmlFor={`${field.name}-${idx}`} className="text-sm text-netral-300 cursor-pointer">{opt.label}</label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    );
                                case "date":
                                    return (
                                        <div className="relative">
                                            <Input type="date" className="bg-netral-950 border-netral-700 pl-10" {...formField} />
                                            <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-netral-500" />
                                        </div>
                                    );
                                default:
                                    return <Input type={field.type} placeholder={field.placeholder} className="bg-netral-950 border-netral-700" {...formField} />;
                            }
                        })()}
                    </FormControl>
                    <FormMessage className="text-tertiary-400 text-xs" />
                </FormItem>
            )}
        />
    );
};

// ==========================================
// 4️⃣ MAIN COMPONENT (THE ENGINE)
// ==========================================

export default function BrainwaveForm({ Data = {} }: IslandProps) {
    const config = safeEntry<FormConfig>(Data, DEFAULT_PARAMS);

    const form = useForm<any>();
    const { isSubmitting } = form.formState;

    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [responseMsg, setResponseMsg] = useState("");

    const onSubmit = async (data: any) => {
        setStatus("idle");

        if (!supabase) {
            setStatus("error");
            setResponseMsg("Konfigurasi Error: Supabase Client belum terinisialisasi.");
            return;
        }

        if (!config.supabase?.table) {
            setStatus("error");
            setResponseMsg("Konfigurasi Error: Nama tabel database belum ditentukan.");
            return;
        }

        try {
            const payload = {
                ...data,
                created_at: new Date().toISOString(), 
            };

            const { error } = await supabase
                .from(config.supabase.table)
                .insert([payload]);

            if (error) throw new Error(error.message);

            setStatus("success");
            setResponseMsg(config.supabase.successMessage || "Data berhasil disimpan.");
            form.reset();

        } catch (error: any) {
            console.error("Submission Error:", error);
            setStatus("error");
            setResponseMsg(config.supabase?.errorMessage || `Gagal menyimpan: ${error.message}`);
        }
    };

    // --- SUCCESS STATE ---
    if (status === "success") {
        return (
            <MotionDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center bg-netral-900 border border-green-900/50 rounded-xl">
                <div className="w-16 h-16 bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Berhasil!</h3>
                <p className="text-netral-400 mb-6">{responseMsg}</p>
                <Button variant="outline" onClick={() => setStatus("idle")} className="border-netral-700 text-white hover:bg-netral-800">
                    Kirim Data Lain
                </Button>
            </MotionDiv>
        );
    }

    // --- FORM RENDER ---
    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                
                {(config.title || config.description) && (
                    <div className="mb-6 text-center sm:text-left">
                        {config.title && <h3 className="text-xl font-bold text-white mb-2">{config.title}</h3>}
                        {config.description && <p className="text-netral-400 text-sm">{config.description}</p>}
                    </div>
                )}

                {/* [FIX] Tampilkan Alert Error Jika Gagal */}
                {status === "error" && (
                    <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-900 text-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Terjadi Kesalahan</AlertTitle>
                        <AlertDescription>{responseMsg}</AlertDescription>
                    </Alert>
                )}

                <MotionDiv initial="hidden" animate="show" variants={ANIM.container} className="space-y-6">
                    
                    <div className="grid grid-cols-2 gap-4">
                        {config.fields?.map((field, idx) => (
                            <MotionDiv key={idx} variants={ANIM.slideUp} className={field.width === "half" ? "col-span-1" : "col-span-2"}>
                                <FieldRenderer field={field} formControl={form.control} />
                            </MotionDiv>
                        ))}
                    </div>

                    <MotionDiv variants={ANIM.slideUp} className="pt-2">
                        <Button type="submit" disabled={isSubmitting} className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold h-12">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                    Memproses...
                                </>
                            ) : (
                                config.submitText || "Kirim"
                            )}
                        </Button>
                    </MotionDiv>

                </MotionDiv>
            </form>
        </FormProvider>
    );
}