import { cn } from "@/modules/lib/utils";
import { ComponentProps } from "preact";

const Section = ({ className, children, ...props }: ComponentProps<"section">) => (
    <section className={cn("py-20 bg-netral-950", className)} {...props}>{children}</section>
);

export { Section };