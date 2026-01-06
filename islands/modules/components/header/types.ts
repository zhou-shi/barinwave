import * as LucideIcons from "lucide-react";

export type LucideIconKey = keyof typeof LucideIcons;

export interface NavigationMenuItems {
  title: string;
  href?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavigationMenuItems[];
}