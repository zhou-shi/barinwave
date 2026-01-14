import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, FileText, ArrowRight, Loader2, 
    LayoutGrid, AlertCircle 
} from "lucide-react";

// --- SHADCN COMPONENTS ---
import { Dialog, DialogContent, DialogTitle } from "@/modules/ui/shadcn/dialog";
import { Input } from "@/modules/ui/shadcn/input"; 
import { Button } from "@/modules/ui/shadcn/button";import { ConfigIsland } from "@/modules/types";

// --- TIPE DATA DARI INDEX.JSON ---
interface SearchResult {
    title: string;
    desc: string;
    url: string;
    type: string;
    date: string;
}

export const config: ConfigIsland = {
    build: false 
};

const SearchDialog = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [data, setData] = useState<SearchResult[]>([]);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Shortcut Keyboard (Ctrl + K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Fetch Data
    useEffect(() => {
        if (open && data.length === 0) {
            setLoading(true);
            fetch("/index.json")
                .then((res) => res.json())
                .then((json) => {
                    setData(json);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Gagal load index pencarian", err);
                    setLoading(false);
                });
        }
    }, [open]);

    // Logic Filtering
    useEffect(() => {
        if (query.trim() === "") {
            setResults([]);
        } else {
            const lowerQuery = query.toLowerCase();
            const filtered = data.filter((item) => 
                item.title.toLowerCase().includes(lowerQuery) || 
                item.desc.toLowerCase().includes(lowerQuery)
            ).slice(0, 5); 
            setResults(filtered);
        }
    }, [query, data]);

    return (
        <>
            {/* TRIGGER BUTTON (Navbar) */}
            <Button 
                variant="outline" 
                onClick={() => setOpen(true)}
                className="hidden md:flex relative h-10 w-full justify-start rounded-[0.5rem] bg-netral-900 border-netral-800 text-sm text-netral-400 sm:pr-12 md:w-40 lg:w-64 hover:bg-netral-800 hover:text-netral-50"
            >
                <span className="inline-flex gap-2 items-center">
                    <Search className="h-4 w-4" />
                    <span className="hidden lg:inline-flex">Cari layanan...</span>
                    <span className="inline-flex lg:hidden">Cari...</span>
                </span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border border-netral-700 bg-netral-950 px-1.5 font-mono text-[10px] font-medium text-netral-400 opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            
            {/* Mobile Trigger */}
            <Button variant="ghost" size="icon" className="md:hidden text-netral-400" onClick={() => setOpen(true)}>
                <Search className="h-5 w-5" />
            </Button>

            {/* DIALOG SEARCH */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-netral-950 border-netral-800 p-0 overflow-hidden sm:max-w-xl gap-0">
                    <DialogTitle className="sr-only">
                        Pencarian Layanan dan Informasi
                    </DialogTitle>

                    {/* INPUT AREA (FIXED) */}
                    <div className="flex items-center border-b border-netral-800 px-3 py-1 relative">
                        <Search className="h-5 w-5 text-netral-500 absolute left-4" />
                        
                        {/* MENGGUNAKAN SHADCN INPUT 
                           Kita override class-nya agar border & ring hilang (fokus style diatur parent div)
                        */}
                        <Input 
                            className="flex h-14 w-full rounded-none border-0 bg-transparent pl-10 pr-4 text-base text-netral-50 placeholder:text-netral-500 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                            placeholder="Ketik kata kunci (misal: 'WBS', 'Laporan')..."
                            value={query}
                            // FIX TYPESCRIPT ERROR: Gunakan currentTarget
                            onChange={(e) => setQuery(e.currentTarget.value)} 
                            autoFocus
                        />

                        {loading && <Loader2 className="animate-spin h-4 w-4 text-primary-500 absolute right-4" />}
                    </div>

                    {/* RESULTS AREA */}
                    <div className="max-h-[60vh] overflow-y-auto p-2">
                        
                        {/* STATE 1: Empty */}
                        {!loading && results.length === 0 && query === "" && (
                            <div className="py-10 text-center text-sm text-netral-500">
                                <LayoutGrid className="mx-auto h-10 w-10 opacity-20 mb-3" />
                                <p>Silakan ketik sesuatu untuk mencari.</p>
                            </div>
                        )}

                        {/* STATE 2: Not Found */}
                        {!loading && results.length === 0 && query !== "" && (
                            <div className="py-10 text-center text-sm text-netral-500">
                                <AlertCircle className="mx-auto h-10 w-10 text-tertiary-500/50 mb-3" />
                                <p>Tidak ada hasil untuk "<span className="text-netral-300">{query}</span>"</p>
                            </div>
                        )}

                        {/* STATE 3: Results Found */}
                        <AnimatePresence>
                            {results.map((item, idx) => (
                                <motion.a
                                    key={idx}
                                    href={item.url}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-start gap-3 rounded-lg p-3 text-sm transition-colors hover:bg-netral-900 group cursor-pointer"
                                >
                                    {/* ICON */}
                                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-netral-800 bg-netral-900 text-netral-400 group-hover:border-primary-500/30 group-hover:text-primary-500 transition-colors">
                                        {item.type === "Layanan" ? <LayoutGrid size={16} /> : <FileText size={16} />}
                                    </div>

                                    {/* TEXT */}
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-netral-200 group-hover:text-primary-400 transition-colors">
                                                {item.title}
                                            </p>
                                            <span className="text-[10px] uppercase tracking-wider text-netral-600 bg-netral-900 px-1.5 py-0.5 rounded border border-netral-800">
                                                {item.type}
                                            </span>
                                        </div>
                                        <p className="text-netral-500 line-clamp-1">
                                            {item.desc || "Tidak ada deskripsi."}
                                        </p>
                                    </div>
                                    
                                    <ArrowRight className="mt-2 h-4 w-4 text-netral-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                </motion.a>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="border-t border-netral-800 px-4 py-2 text-[10px] text-netral-600 flex justify-between">
                         <span>Inspektorat Daerah Prov. Kalbar</span>
                         <span><strong>Esc</strong> untuk menutup</span>
                    </div>

                </DialogContent>
            </Dialog>
        </>
    );
};

export default SearchDialog;