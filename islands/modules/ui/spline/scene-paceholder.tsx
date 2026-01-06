import { h } from "preact";
import { cn } from "@/modules/lib/utils";

 const  ScenePlaceholder = ({ isError = false }) => (
    <div className={cn(
        "w-full h-full flex flex-col items-center justify-center backdrop-blur-sm rounded-3xl border border-white/5 transition-colors",
        isError ? "bg-red-900/10 border-red-500/20" : "bg-primary-900/10 animate-pulse"
    )}>
        {isError ? (
             // Tampilan jika Gagal Load (Minimalis agar tidak merusak estetika)
            <div className="text-center space-y-2 p-6">
                 <div className="text-3xl">⚠️</div>
                 <div className="text-red-400 font-mono text-xs tracking-widest">3D SCENE UNAVAILABLE</div>
                 <div className="text-white/40 text-[10px]">Please check your connection</div>
            </div>
        ) : (
            // Tampilan saat Loading Normal
            <div className="text-primary-500 font-mono text-xs tracking-widest">LOADING 3D MODULE...</div>
        )}
    </div>
);

export default ScenePlaceholder;