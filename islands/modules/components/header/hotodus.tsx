import { useState, useEffect } from "preact/hooks";
import { motion, AnimatePresence, Variants, useReducedMotion } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { cn, keysToCamel, mapHugoMenuEntry } from "@/modules/lib/utils";
import { ConfigIsland, IslandProps } from "@/modules/types";
import { NavigationMenuItems } from "../types";
import { Dispatcher } from "../logos/dispatcher";
import SearchDialog from "@/modules/components/search-dialog";

// --- THEME CONSTANTS ---
// Menggunakan Primary-900 untuk background Header agar pekat/kontras
// Text menggunakan Primary-50 agar terang (di Light Mode)
const THEME_HEADER_BG = "bg-primary-900"; 
const THEME_HEADER_TEXT = "text-primary-50";

// --- SUB-COMPONENT: MOBILE ACCORDION ITEM ---
const MobileAccordionItem = ({ item }: { item: NavigationMenuItems }) => {
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      // Border mengikuti Primary-50 (tipis)
      <div className="border-b border-primary-50/10 last:border-0">
        <a href={item.href || "#"} className={cn("flex items-center w-full py-4 px-2 text-lg font-semibold", THEME_HEADER_TEXT)}>
          {item.title}
        </a>
      </div>
    );
  }

  return (
    <Accordion.Item value={item.title} className="border-b border-primary-50/10 last:border-0">
      <Accordion.Header className="flex">
        <Accordion.Trigger className={cn(
          "flex items-center justify-between w-full py-4 px-2 text-lg font-semibold group transition-colors",
          THEME_HEADER_TEXT,
          // Saat open, gunakan warna Secondary (Teal/Amber) untuk highlight
          "data-[state=open]:text-secondary-300"
        )}>
          {item.title}
          <ChevronDown
            className={cn(
               "w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-data-[state=open]:rotate-180",
               "text-primary-200" // Icon sedikit lebih redup dari teks
            )}
          />
        </Accordion.Trigger>
      </Accordion.Header>

      <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
        {/* Background Submenu: Gelap Transparan (Netral-900) */}
        <div className="bg-netral-900/20 rounded-lg mb-4 mx-2 overflow-hidden">
            <ul className="flex flex-col gap-4 p-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
              {item.children!.map((child, idx) => (
                <li key={idx}>
                  <a href={child.href || "#"} className="flex items-start gap-3 group/link shrink-0">
                  {child.icon && (
                      <div className={cn(
                        "mt-1 p-1.5 rounded-full transition-colors shrink-0",
                        // Default: BG tipis, Text Secondary
                        "bg-primary-50/10 text-secondary-300",
                        // Hover: BG Secondary Full, Text Netral (Kontras)
                        "group-hover/link:bg-secondary-400 group-hover/link:text-netral-50"
                      )}>
                        <child.icon className="w-4 h-4" />
                      </div>
                  )}
                  <div className="flex flex-col">
                      <span className={cn(
                          "text-base font-medium transition-colors",
                          THEME_HEADER_TEXT,
                          "group-hover/link:text-secondary-300"
                      )}>
                      {child.title}
                      </span>
                      {child.description && (
                      <span className={cn("text-xs leading-tight mt-0.5", "text-primary-200/70")}>
                          {child.description}
                      </span>
                      )}
                  </div>
                  </a>
                </li>
              ))}
            </ul>
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
};

// --- SUB-COMPONENT: DESKTOP DROPDOWN ITEM ---
const DesktopDropdownItem = ({ item }: { item: NavigationMenuItems }) => {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <NavigationMenu.Item className="relative">
      {hasChildren ? (
        <>
          <NavigationMenu.Trigger 
            className={cn(
              "group flex items-center gap-1 px-4 py-2 rounded-full transition-colors text-sm font-medium relative z-10",
              // Default Text: Primary-100 (agak redup), Hover: Primary-50 (Terang)
              "text-primary-100 hover:text-primary-50 hover:bg-primary-50/10",
              // Active State
              "data-[state=open]:bg-primary-50/10 data-[state=open]:text-primary-50", 
              // Focus Ring menggunakan Primary
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200/50" 
            )}
          >
            {item.title}
            <ChevronDown 
              className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-70" 
              aria-hidden 
            />
          </NavigationMenu.Trigger>

          <NavigationMenu.Content 
            className={cn(
                "absolute top-full left-1/2 -translate-x-1/2 mt-4", 
                "w-[320px]", // Lebar Dropdown
                // PENTING: overflow-visible agar panah yang nonjol ke atas terlihat
                "overflow-visible", 
                // Animasi Radix
                "data-[motion=from-start]:animate-enterFromLeft",
                "data-[motion=from-end]:animate-enterFromRight",
                "data-[motion=to-start]:animate-exitToLeft",
                "data-[motion=to-end]:animate-exitToRight"
            )}
          >
            <div className="relative">
                {/* 1. PANAH SEGITIGA (Arrow) */}
                {/* Diposisikan absolute ke atas (-top-1.5) agar nonjol keluar dari kotak */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-netral-50 rounded-tl-sm shadow-sm" />

                {/* 2. KOTAK KONTEN (Card) */}
                {/* Background dan Shadow dipindah ke sini */}
                <div className="relative bg-netral-50 rounded-xl shadow-lg overflow-hidden z-10">
                    <ul className="flex flex-col gap-1 max-h-[90dvh] overflow-y-auto scrollbar-hide p-2 m-0 list-none">
                    {item.children!.map((child, idx) => (
                        <li key={idx}>
                            <NavigationMenu.Link asChild>
                                <a href={child.href || "#"} className={cn(
                                    "flex items-start gap-4 p-3 rounded-lg transition-colors group focus:outline-none",
                                    "hover:bg-netral-100 focus:bg-netral-100"
                                )}>
                                    {child.icon && (
                                        <div className={cn(
                                            "shrink-0 p-2 rounded-full transition-colors",
                                            "bg-secondary-50 text-secondary-700",
                                            "group-hover:bg-secondary-600 group-hover:text-netral-50"
                                        )}>
                                        <child.icon className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-netral-950 group-hover:text-secondary-700">
                                            {child.title}
                                        </span>
                                        {child.description && (
                                            <span className="text-xs text-netral-500 mt-1 leading-snug">
                                                {child.description}
                                            </span>
                                        )}
                                    </div>
                                </a>
                            </NavigationMenu.Link>
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
          </NavigationMenu.Content>
        </>
      ) : (
        <NavigationMenu.Link asChild>
          <a 
            href={item.href || "#"} 
            className={cn(
                "flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none",
                "text-primary-100 hover:text-primary-50 hover:bg-primary-50/10",
                "focus-visible:ring-2 focus-visible:ring-primary-200/50"
            )}
          >
            {item.title}
          </a>
        </NavigationMenu.Link>
      )}
    </NavigationMenu.Item>
  );
};

export const config: ConfigIsland = { 
  mode: "interactive", 
  name: "hotodus",
  outputDir: ['layouts', 'partials', 'components', 'header'], 
  createShortcode: false,
};

// --- MAIN COMPONENT ---
export default function Hotodus({ Menus = [], Params = {} }: IslandProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const cleanMenus: NavigationMenuItems[] = mapHugoMenuEntry(Menus);
  const cleanParams = keysToCamel(Params);
  const logoConfig = cleanParams.header?.logo;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    closed: {
      height: "64px",
      borderRadius: "50px",
      transition: { 
        type: shouldReduceMotion ? "tween" : "spring", 
        duration: shouldReduceMotion ? 0 : undefined,
        stiffness: 400, damping: 30, staggerChildren: 0.05, staggerDirection: -1 
      },
    },
    open: {
      height: "auto",
      borderRadius: "24px",
      transition: { 
        type: shouldReduceMotion ? "tween" : "spring", 
        duration: shouldReduceMotion ? 0 : undefined,
        stiffness: 300, damping: 25, staggerChildren: 0.1, delayChildren: 0.2  
      },
    },
    desktop: {
      height: "64px",
      borderRadius: "50px",
      transition: { type: "tween", duration: 0 },
    },
  };

  const contentVariants: Variants = {
      closed: { opacity: 0, y: -10, display: "none" },
      open: { opacity: 1, y: 0, display: "block" },
  };

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center items-center w-full pointer-events-none">
      <motion.nav
        layout
        initial="closed"
        animate={typeof window !== "undefined" && window.innerWidth >= 768 ? "desktop" : isMobileOpen ? "open" : "closed"}
        variants={containerVariants}
        className={cn(
          "pointer-events-auto relative shadow-2xl mx-auto",
          // CONTAINER HEADER: Gunakan Primary-900 (Gelap)
          THEME_HEADER_BG,
          "w-[calc(100%-3rem)] sm:w-[400px] md:w-[calc(100%-4rem)]",
          "overflow-hidden md:overflow-visible",
          isMobileOpen ? "max-h-[85vh]" : ""
        )}
      >
        <div className="flex flex-col w-full h-full relative items-center">
          
          <div className="flex items-center justify-between px-6 md:py-4 py-2 h-16 shrink-0 w-full relative z-20">
            {/* LOGO: Gunakan Text Primary-50 (Terang) */}
            <a href={logoConfig?.href || "#"} className={cn(THEME_HEADER_TEXT,)}>
              <Dispatcher config={logoConfig}/>
            </a>

            {/* --- DESKTOP MENU --- */}
            <div className="hidden md:flex items-center justify-center absolute left-0 right-0 h-full pointer-events-none">
                <NavigationMenu.Root className="pointer-events-auto relative z-10 flex w-full justify-center">
                    <NavigationMenu.List className="flex items-center gap-2 list-none m-0 p-0">
                        {cleanMenus.map((item, idx) => (
                            <DesktopDropdownItem key={idx} item={item} />
                        ))}
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
               {/* Button Desktop: BG Netral-50 (Putih), Text Primary-900 (Gelap) */}
               <a href="#" className={cn(
                 "hidden md:inline-flex items-center justify-center h-10 px-6 rounded-full font-bold text-sm transition-colors",
                 "bg-netral-50 text-primary-900 hover:bg-netral-100"
               )}>
                Let's Talk
              </a>
              <div className="z-50">
                <SearchDialog />
              </div>
              
              <button 
                onClick={() => setIsMobileOpen(!isMobileOpen)} 
                aria-label={isMobileOpen ? "Close menu" : "Open main menu"}
                aria-expanded={isMobileOpen}
                aria-controls="mobile-menu-content"
                className={cn(
                    "md:hidden rounded-md transition-colors",
                    THEME_HEADER_TEXT, // Text Primary-50
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900"
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMobileOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                      <Menu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Mobile Content */}
          <motion.div id="mobile-menu-content" variants={contentVariants} className={cn("md:hidden w-full flex-1 min-h-0", THEME_HEADER_BG)}>
             <ScrollArea.Root className="w-full h-full" type="auto">
                <ScrollArea.Viewport className="w-full h-full pb-6">
                    <div className="px-6 pt-2 flex flex-col gap-2">
                        <Accordion.Root type="single" collapsible className="w-full">
                            {cleanMenus.map((item, index) => (
                            <MobileAccordionItem key={index} item={item} />
                            ))}
                        </Accordion.Root>
                        <div className="mt-4 pt-4 border-t border-primary-50/10 pb-8">
                             <a href="#" className="flex items-center justify-center w-full py-3 bg-netral-50 text-primary-900 font-bold rounded-lg hover:bg-netral-100 transition-colors">
                                Let's Talk
                             </a>
                             <SearchDialog />
                        </div>
                    </div>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar orientation="vertical" className="flex select-none touch-none p-0.5 bg-netral-900/10 transition-colors duration-[160ms] ease-out hover:bg-netral-900/20 data-[orientation=vertical]:w-1.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5">
                    <ScrollArea.Thumb className="flex-1 bg-netral-50/30 rounded-[10px] relative" />
                </ScrollArea.Scrollbar>
             </ScrollArea.Root>
          </motion.div>
        </div>
      </motion.nav>
    </header>
  );
};
