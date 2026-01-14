import { VariantProps } from "class-variance-authority";
import * as LucideIcons from "lucide-react";
import { buttonVariants } from "../ui/shadcn/button";

export type LucideIconKey = keyof typeof LucideIcons;

export type ButtonConfig = {
    label: string;
    url: string;
} & VariantProps<typeof buttonVariants>;

export interface NavigationMenuItems {
  title: string;
  href?: string;
  description?: string;
  icon?: LucideIcons.LucideIcon
  children?: NavigationMenuItems[];
}