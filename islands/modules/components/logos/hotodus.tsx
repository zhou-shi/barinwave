import { h } from "preact";
import { cn } from "@/modules/lib/utils"; 

export interface HotodusProps {
    title?: string;
    imgUrl?: string;
    className?: string; 
}

const Hotodus = ({ title, imgUrl, className }: HotodusProps) => {
  const hasImage = !!imgUrl;
  const hasTitle = !!title;

  console.log("Rendering Hotodus component with:", { title, imgUrl, className });

  return (
    <div
      className={cn(
        "h-12 w-max relative rounded-lg flex items-center justify-center transition-opacity hover:opacity-80",
        "px-2 py-1", 
        className
      )}
    >
       {/* 1. BAGIAN GAMBAR */}
       {hasImage && (
         <div className={cn(
            "flex items-center justify-center h-full",
            hasTitle ? "basis-1/6" : "w-full"
         )}>
            <img 
              src={imgUrl} 
              alt={title || "Logo"} 
              className="max-h-full max-w-full object-contain" 
            />
         </div>
       )}

       {/* 2. BAGIAN JUDUL */}
       {hasTitle && (
         <div className={cn(
            "flex items-center h-full",
            hasImage ? "basis-5/6 pl-3 justify-start" : "w-full justify-center"
         )}>
            <span className="font-bold text-xl text-foreground truncate">
              {title}
            </span>
         </div>
       )}
    </div>
  );
};

export default Hotodus;