import { IslandProps } from "@/modules/types";
import { cn } from "@/modules/lib/utils";
import { h } from "../../lib/hugo-bridge";
import { HugoRaw } from "@/modules/ui/brainwave/hugo-raw";

export default function ContentBlock({}: IslandProps) {
    const VAR_NAME = "$finalData"; 
    const LIST_PATH = `${VAR_NAME}.contentBlock`;
    
    // Gunakan scope base "."
    const item = h.scope("", "."); 

    const generateDynamicClasses = () => {
        // Gunakan parameter ke-4 (raw=true) untuk logika
        const align = item("align", undefined, undefined, true); 
        const width = item("maxWidth", undefined, undefined, true);

        const alignLogic = `{{ if eq ${align} "center" }}text-center mx-auto{{ else if eq ${align} "right" }}text-right ml-auto{{ else }}text-left{{ end }}`;
        const widthLogic = `{{ if eq ${width} "sm" }}max-w-2xl{{ else if eq ${width} "lg" }}max-w-6xl{{ else if eq ${width} "full" }}max-w-full{{ else }}max-w-4xl{{ end }}`;

        return `class="container relative z-10 px-4 ${alignLogic} ${widthLogic}"`;
    };

    return (
        <section className="w-full py-16 px-6">
            <HugoRaw code={h.mergeParams(VAR_NAME)} />
            <HugoRaw code={h.range("", LIST_PATH)} />
                
                <HugoRaw code={`<div ${generateDynamicClasses()}>`} />
                    
                    {/* TITLE */}
                    <HugoRaw code={`{{ if ${item("title", undefined, undefined, true)} }}`} />
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            <HugoRaw code={item("title")} />
                        </h2>
                    <HugoRaw code={h.end()} />

                    {/* CONTENT (PERBAIKAN DISINI) */}
                    <div 
                        className={cn(
                            // 1. Tambahkan 'text-netral-300' explisit agar warna keluar
                            "text-netral-300 leading-relaxed",
                            
                            // 2. Class Prose tetap ada untuk spacing
                            "prose prose-invert prose-lg max-w-none",
                            "prose-headings:font-bold prose-headings:text-white",
                            "prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline",
                            "prose-strong:text-white"
                        )}
                    >
                        {/* GANTI: "markdownify" -> "safeHTML" 
                           GANTI: "" -> undefined (untuk argumen default)
                           Hasil: {{ .content | safeHTML }} 
                        */}
                        <HugoRaw code={item("content", undefined, "safeHTML")} />
                    </div>

                <HugoRaw code="</div>" />
            <HugoRaw code={h.end()} />
        </section>
    );
}