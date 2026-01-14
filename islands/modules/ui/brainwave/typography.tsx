import * as React from "preact/compat";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/modules/lib/utils"; // Sesuaikan path utils Anda

// 1. Definisi Styles dengan CVA
const typographyVariants = cva(
  "text-netral-400 leading-relaxed", // Base styles
  {
    variants: {
      variant: {
        h1: "text-4xl md:text-5xl font-bold text-white mb-6 scroll-m-20 tracking-tight",
        h2: "text-3xl font-bold text-white mb-4 border-b border-netral-800 pb-2 scroll-m-20 tracking-tight first:mt-0",
        h3: "text-2xl font-bold text-white mb-3 scroll-m-20 tracking-tight",
        h4: "text-xl font-bold text-white mb-2 scroll-m-20 tracking-tight",
        p: "leading-7 [&:not(:first-child)]:mt-6",
        blockquote: "mt-6 border-l-2 border-netral-700 pl-6 italic text-netral-300",
        list: "my-6 ml-6 list-disc [&>li]:mt-2",
        code: "relative rounded bg-netral-900 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-netral-200",
        lead: "text-xl text-netral-400",
        large: "text-lg font-semibold text-netral-200",
        small: "text-sm font-medium leading-none text-netral-500",
        muted: "text-sm text-netral-500",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      }
    },
    defaultVariants: {
      variant: "p",
      align: "left",
    },
  }
);

// 2. Interface Props
export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  asChild?: boolean;
}

// 3. Component Implementation
const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, align, asChild = false, ...props }, ref) => {
    // Logika penentuan Tag HTML:
    // Jika asChild=true, gunakan Slot.
    // Jika tidak, gunakan nama variant sebagai tag (h1, h2, p).
    // Jika variant tidak valid sebagai tag (misal 'lead', 'muted'), fallback ke 'p' atau 'span'.
    
    let Comp: React.ElementType = asChild ? Slot : "p";

    if (!asChild && variant) {
      // Daftar tag HTML yang valid sesuai nama variant
      const validTags = ["h1", "h2", "h3", "h4", "p", "blockquote", "code"];
      if (validTags.includes(variant)) {
        Comp = variant as React.ElementType;
      } else if (variant === "list") {
        Comp = "ul";
      } else if (variant === "large" || variant === "lead" || variant === "small" || variant === "muted") {
        Comp = "p"; // Variant styling saja, tag tetap p
      }
    }

    return (
      <Comp
        className={cn(typographyVariants({ variant, align, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Typography.displayName = "Typography";

export { Typography, typographyVariants };