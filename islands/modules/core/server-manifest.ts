// ----------------------------------------------------------------------
// AUTO-GENERATED FILE by islands/core/scan-server.ts
// ----------------------------------------------------------------------

import React from "preact/compat";

import * as UiContainer from "../ui/brainwave/container";
import * as UiMobileMenu from "../ui/brainwave/mobile-menu";
import * as UiSection from "../ui/brainwave/section";
import * as UiTypography from "../ui/brainwave/typography";
import * as LwAuroraTextEffect from "../ui/lightswind/aurora-text-effect";
import * as LwBorderBeam from "../ui/lightswind/border-beam";
import * as LwElectroBorder from "../ui/lightswind/electro-border";
import * as LwShineButton from "../ui/lightswind/shine-button";
import * as LwThemeToggle from "../ui/lightswind/theme-toggle";
import * as LwVideoText from "../ui/lightswind/video-text";
import * as ShadcnAccordion from "../ui/shadcn/accordion";
import * as ShadcnAlert from "../ui/shadcn/alert";
import * as ShadcnButton from "../ui/shadcn/button";
import * as ShadcnCard from "../ui/shadcn/card";
import * as ShadcnDialog from "../ui/shadcn/dialog";
import * as ShadcnForm from "../ui/shadcn/form";
import * as ShadcnInput from "../ui/shadcn/input";
import * as ShadcnLabel from "../ui/shadcn/label";
import * as ShadcnNavigationMenu from "../ui/shadcn/navigation-menu";
import * as ShadcnPopover from "../ui/shadcn/popover";
import * as ShadcnRadioGroup from "../ui/shadcn/radio-group";
import * as ShadcnSelect from "../ui/shadcn/select";
import * as ShadcnTabs from "../ui/shadcn/tabs";
import * as ShadcnTextarea from "../ui/shadcn/textarea";
import * as CompFooter from "../components/footer";
import * as CompForm from "../components/form";
import * as CompHeaderBrainwave from "../components/header/brainwave";
import * as CompHeaderHotodus from "../components/header/hotodus";
import * as CompLogosBrainwave from "../components/logos/brainwave";
import * as CompLogosDispatcher from "../components/logos/dispatcher";
import * as CompLogosHotodus from "../components/logos/hotodus";
import * as CompOldContentBlock from "../components/old/content-block";
import * as CompOldCta from "../components/old/cta";
import * as CompOldFeatures from "../components/old/features";
import * as CompOldHeroModern from "../components/old/hero-modern";
import * as CompOldHero from "../components/old/hero";
import * as CompOldNews from "../components/old/news";
import * as CompOldStats from "../components/old/stats";
import * as CompSearchDialog from "../components/search-dialog";


/**
 * Helper 1: Membongkar export (kecuali default)
 */
const expandModule = (module: any, prefix: string) => {
    const result: Record<string, any> = {};
    Object.keys(module).forEach(key => {
        if (key === 'default') return;
        const Component = module[key];
        if (typeof Component === 'function' || typeof Component === 'object') {
            result[`${prefix}${key}`] = Component;
        }
    });
    return result;
};

/**
 * Helper 2: Mencari Komponen Utama secara Aman (Lazy)
 * Urutan Prioritas:
 * 1. Named Export yang sesuai nama file (misal: export const Section)
 * 2. Default Export
 * 3. Named Export pertama yang ditemukan (Fallback terakhir)
 */
const resolveComponent = (module: any, name: string) => {
    // Coba cari Named Export spesifik (misal: "Section")
    if (module[name]) return module[name];
    
    // Coba cari Default
    if (module.default) return module.default;
    
    // Fallback: Cari export apapun yang bukan default
    const keys = Object.keys(module).filter(k => k !== 'default');
    if (keys.length > 0) return module[keys[0]];

    return undefined;
};


export const SERVER_COMPONENTS: Record<string, any> = {
    ...expandModule(UiContainer, "Ui"),
    "UiContainer": resolveComponent(UiContainer, "Container"),
    ...expandModule(UiMobileMenu, "Ui"),
    "UiMobileMenu": resolveComponent(UiMobileMenu, "MobileMenu"),
    ...expandModule(UiSection, "Ui"),
    "UiSection": resolveComponent(UiSection, "Section"),
    ...expandModule(UiTypography, "Ui"),
    "UiTypography": resolveComponent(UiTypography, "Typography"),
    ...expandModule(LwAuroraTextEffect, "Lw"),
    "LwAuroraTextEffect": resolveComponent(LwAuroraTextEffect, "AuroraTextEffect"),
    ...expandModule(LwBorderBeam, "Lw"),
    "LwBorderBeam": resolveComponent(LwBorderBeam, "BorderBeam"),
    ...expandModule(LwElectroBorder, "Lw"),
    "LwElectroBorder": resolveComponent(LwElectroBorder, "ElectroBorder"),
    ...expandModule(LwShineButton, "Lw"),
    "LwShineButton": resolveComponent(LwShineButton, "ShineButton"),
    ...expandModule(LwThemeToggle, "Lw"),
    "LwThemeToggle": resolveComponent(LwThemeToggle, "ThemeToggle"),
    ...expandModule(LwVideoText, "Lw"),
    "LwVideoText": resolveComponent(LwVideoText, "VideoText"),
    ...expandModule(ShadcnAccordion, "shadcn/"),
    "shadcn/Accordion": resolveComponent(ShadcnAccordion, "Accordion"),
    ...expandModule(ShadcnAlert, "shadcn/"),
    "shadcn/Alert": resolveComponent(ShadcnAlert, "Alert"),
    ...expandModule(ShadcnButton, "shadcn/"),
    "shadcn/Button": resolveComponent(ShadcnButton, "Button"),
    ...expandModule(ShadcnCard, "shadcn/"),
    "shadcn/Card": resolveComponent(ShadcnCard, "Card"),
    ...expandModule(ShadcnDialog, "shadcn/"),
    "shadcn/Dialog": resolveComponent(ShadcnDialog, "Dialog"),
    ...expandModule(ShadcnForm, "shadcn/"),
    "shadcn/Form": resolveComponent(ShadcnForm, "Form"),
    ...expandModule(ShadcnInput, "shadcn/"),
    "shadcn/Input": resolveComponent(ShadcnInput, "Input"),
    ...expandModule(ShadcnLabel, "shadcn/"),
    "shadcn/Label": resolveComponent(ShadcnLabel, "Label"),
    ...expandModule(ShadcnNavigationMenu, "shadcn/"),
    "shadcn/NavigationMenu": resolveComponent(ShadcnNavigationMenu, "NavigationMenu"),
    ...expandModule(ShadcnPopover, "shadcn/"),
    "shadcn/Popover": resolveComponent(ShadcnPopover, "Popover"),
    ...expandModule(ShadcnRadioGroup, "shadcn/"),
    "shadcn/RadioGroup": resolveComponent(ShadcnRadioGroup, "RadioGroup"),
    ...expandModule(ShadcnSelect, "shadcn/"),
    "shadcn/Select": resolveComponent(ShadcnSelect, "Select"),
    ...expandModule(ShadcnTabs, "shadcn/"),
    "shadcn/Tabs": resolveComponent(ShadcnTabs, "Tabs"),
    ...expandModule(ShadcnTextarea, "shadcn/"),
    "shadcn/Textarea": resolveComponent(ShadcnTextarea, "Textarea"),
    ...expandModule(CompFooter, "Comp"),
    "CompFooter": resolveComponent(CompFooter, "Footer"),
    ...expandModule(CompForm, "Comp"),
    "CompForm": resolveComponent(CompForm, "Form"),
    ...expandModule(CompHeaderBrainwave, "Comp"),
    "CompHeaderBrainwave": resolveComponent(CompHeaderBrainwave, "HeaderBrainwave"),
    ...expandModule(CompHeaderHotodus, "Comp"),
    "CompHeaderHotodus": resolveComponent(CompHeaderHotodus, "HeaderHotodus"),
    ...expandModule(CompLogosBrainwave, "Comp"),
    "CompLogosBrainwave": resolveComponent(CompLogosBrainwave, "LogosBrainwave"),
    ...expandModule(CompLogosDispatcher, "Comp"),
    "CompLogosDispatcher": resolveComponent(CompLogosDispatcher, "LogosDispatcher"),
    ...expandModule(CompLogosHotodus, "Comp"),
    "CompLogosHotodus": resolveComponent(CompLogosHotodus, "LogosHotodus"),
    ...expandModule(CompOldContentBlock, "Comp"),
    "CompOldContentBlock": resolveComponent(CompOldContentBlock, "OldContentBlock"),
    ...expandModule(CompOldCta, "Comp"),
    "CompOldCta": resolveComponent(CompOldCta, "OldCta"),
    ...expandModule(CompOldFeatures, "Comp"),
    "CompOldFeatures": resolveComponent(CompOldFeatures, "OldFeatures"),
    ...expandModule(CompOldHeroModern, "Comp"),
    "CompOldHeroModern": resolveComponent(CompOldHeroModern, "OldHeroModern"),
    ...expandModule(CompOldHero, "Comp"),
    "CompOldHero": resolveComponent(CompOldHero, "OldHero"),
    ...expandModule(CompOldNews, "Comp"),
    "CompOldNews": resolveComponent(CompOldNews, "OldNews"),
    ...expandModule(CompOldStats, "Comp"),
    "CompOldStats": resolveComponent(CompOldStats, "OldStats"),
    ...expandModule(CompSearchDialog, "Comp"),
    "CompSearchDialog": resolveComponent(CompSearchDialog, "SearchDialog"),
};