import {clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { HugoMenuEntry } from "../types";
import { LucideIconKey, NavigationMenuItems } from "../features/header/types";
import * as LucideIcons from "lucide-react";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const mapHugoMenuEntry = (entry: HugoMenuEntry[]): NavigationMenuItems[] => {
  if (!entry || !Array.isArray(entry)) return [];
  return entry.map((e) => {
    const rawName = e.Params?.icon;
    const isValidIcon = typeof rawName === "string" && rawName in LucideIcons;
    const IconComponent = isValidIcon ? LucideIcons[rawName as LucideIconKey] : undefined;
    return {
      title: e.Name || "",
      href: e.URL,
      description: e.Params?.description || "",
      icon: IconComponent,
      children: e.Children ? mapHugoMenuEntry(e.Children) : [],
    };
  });
};

// Fungsi untuk mengubah string "foo-bar" menjadi "fooBar"
const toCamel = (s: string): string => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

// Fungsi rekursif untuk mengubah object keys
export const keysToCamel = (o: any): any => {
  // Jika ini adalah object, dan bukan array, dan bukan null
  if (o === Object(o) && !Array.isArray(o) && typeof o !== 'function') {
    const n: any = {};
    Object.keys(o).forEach((k) => {
      // Ubah key menjadi camelCase, lalu rekursif untuk isinya (value)
      n[toCamel(k)] = keysToCamel(o[k]);
    });
    return n;
  } 
  // Jika array, map setiap itemnya
  else if (Array.isArray(o)) {
    return o.map((i) => keysToCamel(i));
  }
  
  // Jika tipe data primitif (string, number), kembalikan langsung
  return o;
};