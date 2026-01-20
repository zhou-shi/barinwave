// ----------------------------------------------------------------------
// AUTO-GENERATED FILE by islands/core/scan-server.ts
// ----------------------------------------------------------------------

import React from "preact/compat";

import * as UiBrainwaveContainer from "../ui/brainwave/container";
import * as UiBrainwaveHugoRaw from "../ui/brainwave/hugo-raw";
import * as UiBrainwaveMobileMenu from "../ui/brainwave/mobile-menu";
import * as UiBrainwaveSection from "../ui/brainwave/section";
import * as UiBrainwaveTypography from "../ui/brainwave/typography";
import * as UiLightswindAuroraTextEffect from "../ui/lightswind/aurora-text-effect";
import * as UiLightswindBorderBeam from "../ui/lightswind/border-beam";
import * as UiLightswindElectroBorder from "../ui/lightswind/electro-border";
import * as UiLightswindShineButton from "../ui/lightswind/shine-button";
import * as UiLightswindThemeToggle from "../ui/lightswind/theme-toggle";
import * as UiLightswindVideoText from "../ui/lightswind/video-text";
import * as UiShadcnAccordion from "../ui/shadcn/accordion";
import * as UiShadcnAlert from "../ui/shadcn/alert";
import * as UiShadcnButton from "../ui/shadcn/button";
import * as UiShadcnCard from "../ui/shadcn/card";
import * as UiShadcnDialog from "../ui/shadcn/dialog";
import * as UiShadcnForm from "../ui/shadcn/form";
import * as UiShadcnInput from "../ui/shadcn/input";
import * as UiShadcnLabel from "../ui/shadcn/label";
import * as UiShadcnNavigationMenu from "../ui/shadcn/navigation-menu";
import * as UiShadcnPopover from "../ui/shadcn/popover";
import * as UiShadcnRadioGroup from "../ui/shadcn/radio-group";
import * as UiShadcnSelect from "../ui/shadcn/select";
import * as UiShadcnTabs from "../ui/shadcn/tabs";
import * as UiShadcnTextarea from "../ui/shadcn/textarea";
import * as UiSplineSceneIcon from "../ui/spline/scene-icon";
import * as UiSplineScenePaceholder from "../ui/spline/scene-paceholder";
import * as UiSplineScene from "../ui/spline/scene";
import * as ComponentsFooter from "../components/footer";
import * as ComponentsForm from "../components/form";
import * as ComponentsHeaderBrainwave from "../components/header/brainwave";
import * as ComponentsHeaderHotodus from "../components/header/hotodus";
import * as ComponentsLogosBrainwave from "../components/logos/brainwave";
import * as ComponentsLogosDispatcher from "../components/logos/dispatcher";
import * as ComponentsLogosHotodus from "../components/logos/hotodus";
import * as ComponentsOldContentBlock from "../components/old/content-block";
import * as ComponentsOldCta from "../components/old/cta";
import * as ComponentsOldFeatures from "../components/old/features";
import * as ComponentsOldHeroModern from "../components/old/hero-modern";
import * as ComponentsOldHero from "../components/old/hero";
import * as ComponentsOldNews from "../components/old/news";
import * as ComponentsOldStats from "../components/old/stats";
import * as ComponentsSearchDialog from "../components/search-dialog";
import * as PagesHome from "../pages/home";
import * as PagesLayananGratifikasi from "../pages/layanan/gratifikasi";
import * as PagesLayananKonsultasi from "../pages/layanan/konsultasi";
import * as PagesLayananWbs from "../pages/layanan/wbs";
import * as CoreUiEngineClient from "./ui-engine-client";
import * as CoreUiEngineServer from "./ui-engine-server";


/**
 * Helper: Mencari Default Export secara Aman
 */
const resolveDefault = (module: any, name: string) => {
    // 1. Cek Default
    if (module.default) return module.default;
    
    // 2. Cek Named Export yang sama dengan nama file (PascalCase)
    // Contoh: file button.tsx -> export const Button
    const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
    if (module[pascalName]) return module[pascalName];

    // 3. Fallback: Ambil apa saja yang ada
    const keys = Object.keys(module).filter(k => k !== 'default');
    if (keys.length > 0) return module[keys[0]];

    return undefined;
};


export const SERVER_COMPONENTS: Record<string, any> = {
    "brainwave/container": UiBrainwaveContainer.Container,
    "brainwave/hugo-raw": UiBrainwaveHugoRaw.HugoRaw,
    "brainwave/menu-item-layout": UiBrainwaveMobileMenu.MenuItemLayout,
    "brainwave/mobile-menu-item": UiBrainwaveMobileMenu.MobileMenuItem,
    "brainwave/mobile-menu": resolveDefault(UiBrainwaveMobileMenu, "mobile-menu"),
    "brainwave/section": UiBrainwaveSection.Section,
    "brainwave/typography": UiBrainwaveTypography.Typography,
    "brainwave/typography-variants": UiBrainwaveTypography.typographyVariants,
    "lightswind/aurora-text-effect": UiLightswindAuroraTextEffect.AuroraTextEffect,
    "lightswind/border-beam": UiLightswindBorderBeam.BorderBeam,
    "lightswind/electro-border": UiLightswindElectroBorder.ElectroBorder,
    "lightswind/shine-button": UiLightswindShineButton.ShineButton,
    "lightswind/toggle-theme": UiLightswindThemeToggle.ToggleTheme,
    "lightswind/theme-toggle": resolveDefault(UiLightswindThemeToggle, "theme-toggle"),
    "lightswind/video-text": UiLightswindVideoText.VideoText,
    "shadcn/accordion": UiShadcnAccordion.Accordion,
    "shadcn/accordion-item": UiShadcnAccordion.AccordionItem,
    "shadcn/accordion-trigger": UiShadcnAccordion.AccordionTrigger,
    "shadcn/accordion-content": UiShadcnAccordion.AccordionContent,
    "shadcn/alert": UiShadcnAlert.Alert,
    "shadcn/alert-title": UiShadcnAlert.AlertTitle,
    "shadcn/alert-description": UiShadcnAlert.AlertDescription,
    "shadcn/button": UiShadcnButton.Button,
    "shadcn/button-variants": UiShadcnButton.buttonVariants,
    "shadcn/card": UiShadcnCard.Card,
    "shadcn/card-header": UiShadcnCard.CardHeader,
    "shadcn/card-footer": UiShadcnCard.CardFooter,
    "shadcn/card-title": UiShadcnCard.CardTitle,
    "shadcn/card-action": UiShadcnCard.CardAction,
    "shadcn/card-description": UiShadcnCard.CardDescription,
    "shadcn/card-content": UiShadcnCard.CardContent,
    "shadcn/dialog": UiShadcnDialog.Dialog,
    "shadcn/dialog-close": UiShadcnDialog.DialogClose,
    "shadcn/dialog-content": UiShadcnDialog.DialogContent,
    "shadcn/dialog-description": UiShadcnDialog.DialogDescription,
    "shadcn/dialog-footer": UiShadcnDialog.DialogFooter,
    "shadcn/dialog-header": UiShadcnDialog.DialogHeader,
    "shadcn/dialog-overlay": UiShadcnDialog.DialogOverlay,
    "shadcn/dialog-portal": UiShadcnDialog.DialogPortal,
    "shadcn/dialog-title": UiShadcnDialog.DialogTitle,
    "shadcn/dialog-trigger": UiShadcnDialog.DialogTrigger,
    "shadcn/use-form-field": UiShadcnForm.useFormField,
    "shadcn/form": UiShadcnForm.Form,
    "shadcn/form-item": UiShadcnForm.FormItem,
    "shadcn/form-label": UiShadcnForm.FormLabel,
    "shadcn/form-control": UiShadcnForm.FormControl,
    "shadcn/form-description": UiShadcnForm.FormDescription,
    "shadcn/form-message": UiShadcnForm.FormMessage,
    "shadcn/form-field": UiShadcnForm.FormField,
    "shadcn/input": UiShadcnInput.Input,
    "shadcn/label": UiShadcnLabel.Label,
    "shadcn/navigation-menu": UiShadcnNavigationMenu.NavigationMenu,
    "shadcn/navigation-menu-list": UiShadcnNavigationMenu.NavigationMenuList,
    "shadcn/navigation-menu-item": UiShadcnNavigationMenu.NavigationMenuItem,
    "shadcn/navigation-menu-content": UiShadcnNavigationMenu.NavigationMenuContent,
    "shadcn/navigation-menu-trigger": UiShadcnNavigationMenu.NavigationMenuTrigger,
    "shadcn/navigation-menu-link": UiShadcnNavigationMenu.NavigationMenuLink,
    "shadcn/navigation-menu-indicator": UiShadcnNavigationMenu.NavigationMenuIndicator,
    "shadcn/navigation-menu-viewport": UiShadcnNavigationMenu.NavigationMenuViewport,
    "shadcn/navigation-menu-trigger-style": UiShadcnNavigationMenu.navigationMenuTriggerStyle,
    "shadcn/popover": UiShadcnPopover.Popover,
    "shadcn/popover-trigger": UiShadcnPopover.PopoverTrigger,
    "shadcn/popover-content": UiShadcnPopover.PopoverContent,
    "shadcn/popover-anchor": UiShadcnPopover.PopoverAnchor,
    "shadcn/radio-group": UiShadcnRadioGroup.RadioGroup,
    "shadcn/radio-group-item": UiShadcnRadioGroup.RadioGroupItem,
    "shadcn/select": UiShadcnSelect.Select,
    "shadcn/select-content": UiShadcnSelect.SelectContent,
    "shadcn/select-group": UiShadcnSelect.SelectGroup,
    "shadcn/select-item": UiShadcnSelect.SelectItem,
    "shadcn/select-label": UiShadcnSelect.SelectLabel,
    "shadcn/select-scroll-down-button": UiShadcnSelect.SelectScrollDownButton,
    "shadcn/select-scroll-up-button": UiShadcnSelect.SelectScrollUpButton,
    "shadcn/select-separator": UiShadcnSelect.SelectSeparator,
    "shadcn/select-trigger": UiShadcnSelect.SelectTrigger,
    "shadcn/select-value": UiShadcnSelect.SelectValue,
    "shadcn/tabs": UiShadcnTabs.Tabs,
    "shadcn/tabs-list": UiShadcnTabs.TabsList,
    "shadcn/tabs-trigger": UiShadcnTabs.TabsTrigger,
    "shadcn/tabs-content": UiShadcnTabs.TabsContent,
    "shadcn/textarea": UiShadcnTextarea.Textarea,
    "spline/scene-icon": resolveDefault(UiSplineSceneIcon, "scene-icon"),
    "spline/scene-paceholder": resolveDefault(UiSplineScenePaceholder, "scene-paceholder"),
    "spline/scene": resolveDefault(UiSplineScene, "scene"),
    "components/footer": ComponentsFooter.Footer,
    "components/form": resolveDefault(ComponentsForm, "form"),
    "components/header/brainwave": resolveDefault(ComponentsHeaderBrainwave, "brainwave"),
    "components/header/hotodus": resolveDefault(ComponentsHeaderHotodus, "hotodus"),
    "components/logos/brainwave": resolveDefault(ComponentsLogosBrainwave, "brainwave"),
    "components/dispatcher": ComponentsLogosDispatcher.Dispatcher,
    "components/logos/dispatcher": resolveDefault(ComponentsLogosDispatcher, "dispatcher"),
    "components/logos/hotodus": resolveDefault(ComponentsLogosHotodus, "hotodus"),
    "components/old/content-block": resolveDefault(ComponentsOldContentBlock, "content-block"),
    "components/old/cta": resolveDefault(ComponentsOldCta, "cta"),
    "components/old/features": resolveDefault(ComponentsOldFeatures, "features"),
    "components/old/hero-modern": resolveDefault(ComponentsOldHeroModern, "hero-modern"),
    "components/old/hero": resolveDefault(ComponentsOldHero, "hero"),
    "components/old/news": resolveDefault(ComponentsOldNews, "news"),
    "components/old/stats": resolveDefault(ComponentsOldStats, "stats"),
    "components/search-dialog": resolveDefault(ComponentsSearchDialog, "search-dialog"),
    "page/home": PagesHome.Home,
    "page/gratifikasi": PagesLayananGratifikasi.Gratifikasi,
    "page/layanan/gratifikasi": resolveDefault(PagesLayananGratifikasi, "gratifikasi"),
    "page/konsultasi": PagesLayananKonsultasi.Konsultasi,
    "page/layanan/konsultasi": resolveDefault(PagesLayananKonsultasi, "konsultasi"),
    "page/wbs": PagesLayananWbs.WBS,
    "page/layanan/wbs": resolveDefault(PagesLayananWbs, "wbs"),
    "UiEngineClient": resolveDefault(CoreUiEngineClient, "UiEngineClient"),
    "UiEngineServer": resolveDefault(CoreUiEngineServer, "UiEngineServer"),
};