import { cn } from "@/modules/lib/utils";
import { ComponentProps } from "preact";

const Container = ({ className, children, ...props }: ComponentProps<"div">) => (
    <div className={cn("container mx-auto px-6", className)} {...props}>{children}</div>
);

export { Container };