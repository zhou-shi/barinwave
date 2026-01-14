import { useIsMobile } from "@/modules/hooks/use-mobile";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/modules/ui/shadcn/navigation-menu";
import { 
   motion, 
   HTMLMotionProps, 
   MotionConfig, 
   Variants 
} from "framer-motion";
import { MenuItemLayout, MobileMenuItem } from "@/modules/ui/brainwave/mobile-menu";
import { cn, keysToCamel, mapHugoMenuEntry } from "@/modules/lib/utils";
import { ToggleTheme } from "@/modules/ui/lightswind/theme-toggle";
import { ConfigIsland, IslandProps } from "@/modules/types";
import { ShineButton } from "@/modules/ui/lightswind/shine-button";
import { useEffect, useState } from "preact/hooks";
import { NavigationMenuItems } from "../types";
import { Dispatcher } from "../logos/dispatcher";

const MotionSpan = ({className,...props}:HTMLMotionProps<"span">) => (
  <motion.span
    className={cn("bg-linear-to-r/oklch from-primary to-secondary w-7 h-1 rounded-full shadow-xs shadow-netral-950 inset-shadow-xs inset-shadow-netral-950",
      className
    )}
    {...props}
  />
);

const NavigationMenuToggle = ({ toggle, isOpen, className }: { toggle: () => void, isOpen: boolean, className?: string }) => {
  return (
    <MotionConfig transition={{ duration: 0.3, ease: "easeInOut" }}>
      <button
        onClick={toggle}
        className={cn(
          "relative h-12 w-12 rounded-full bg-transparent flex flex-col justify-center items-center gap-1.5 z-50 outline-none", 
          className
        )}
      >
        <MotionSpan
          animate={isOpen ? { rotate: 45, y: 9.9 } : { rotate: 0, y: 0 }}
        />

        <MotionSpan
          animate={isOpen ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
          />

        <MotionSpan
          animate={isOpen ? { rotate: -45, y: -9.9 } : { rotate: 0, y: 0 }}
        />
      </button>
    </MotionConfig>
  );
};

const sidebarVariants: Variants = {
    open: (height = 1000) => ({
        clipPath: `circle(${height * 2 + 200}px at calc(100% - 40px) 40px)`,
        transition: {
            type: "spring",
            stiffness: 20,
            restDelta: 2,
            duration: 0.3
        },
    }),
    closed: {
        clipPath: "circle(30px at calc(100% - 40px) 40px)",
        transition: {
            delay: 0.2,
            type: "spring",
            stiffness: 400,
            damping: 40,
            duration: 0.3
        },
    },
    desktop: {
        clipPath: "none",
        transition: {
          type: "tween",
          duration: 0,
        }
    }
};

const backgroundVariants: Variants = {
    open: {
        opacity: 1,
        transition: { 
            duration: 0.3,
            ease: "linear"
        }
    },
    closed: {
        opacity: 0,
        transition: { 
            duration: 0.3, 
            ease: "linear",
            delay: 0.3 
        }
    },
    desktop: {
        opacity: 0,
        transition: { duration: 0 }
    }
};

const ResponsiveNavigation = ({Menus=[]}: {Menus: NavigationMenuItems[]}) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const handleLinkClick = () => setIsOpen(false);

  return (
    <motion.nav
      initial={false}
      animate={isMobile ? (isOpen ? "open" : "closed") : "desktop"}
      variants={sidebarVariants}
      className={cn(
        isMobile 
          ? "w-full h-full fixed top-0 right-0 flex items-center justify-center transition-colors duration-300 xs:w-[clamp(28rem,80%,48rem)] xs:rounded-tl-2xl xs:rounded-bl-2xl overflow-hidden"
          : "relative"
      )}
    >
      {isMobile && (
        <motion.div
          className="absolute inset-0 -z-10 bg-linear-to-br/oklch from-primary-600 to-secondary-300 backdrop-blur-xs"
          variants={backgroundVariants}
        />
      )}

      {isMobile ? (
        <div className="w-full h-full flex flex-col pt-32 px-6 overflow-y-auto scrollbar-hide">
            <div className="flex flex-col gap-2 w-full pb-40"> 
              {Menus.map((item, index) => (
                <MobileMenuItem 
                    key={index} 
                    item={item} 
                    onLinkClick={handleLinkClick} 
                />
              ))}
            </div>
        </div>
      ) : (
        <NavigationMenu viewport={isMobile}>
            <NavigationMenuList>
              {Menus.map((item, index) => (
                <NavigationMenuItem key={index} >
                  {item.children && item.children.length > 0 ? (
                    <>
                      <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                      <NavigationMenuContent className="from-primary-600 to-secondary-600">
                        <ul className="grid w-75 gap-4 max-h-[90dvh] overflow-y-auto scrollbar-hide">
                          {item.children.map((child, childIndex) => (
                            <li key={childIndex}>
                              {child.href
                                ? (
                                    <NavigationMenuLink href={child.href}>
                                      <MenuItemLayout
                                        title={child.title}
                                        description={child.description}
                                        icon={child.icon}
                                        hasChildren={child.children && child.children.length > 0}
                                      />
                                    </NavigationMenuLink>
                                ) : (
                                  <div className="text-primary-950/70 p-2 text-sm">
                                    <MenuItemLayout 
                                       title={child.title}
                                    />
                                  </div>
                                )
                              }
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink href={item.href || "#"}>
                      <MenuItemLayout
                        title={item.title}
                        description={item.description}
                        icon={item.icon}
                      />
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
        </NavigationMenu>
      )}

      {isMobile && (
        <>
          <motion.div
             key="mobile-header-blur"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.3 }}
             className={cn(
               "absolute top-0 left-0 w-full z-40 xs:rounded-tl-2xl py-2", // z-40 (di atas konten, di bawah tombol)
               "backdrop-blur-md transition-colors duration-75", // Efek blur kaca
               // Gradient agar blur-nya memudar halus ke bawah (tidak patah kotak)
               "[mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]",
               // Opsional: Sedikit background warna agar teks di belakang benar-benar tidak terbaca
               "bg-linear-to-r/oklch from-primary-600/10 to-secondary-600/10",
               isOpen && "py-14"
             )}
          />
          
          <motion.div
             key="mobile-header-strip"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.3 }}
             className="absolute top-0 left-0 z-100 flex items-center justify-end p-4 pointer-events-none w-full"
          > 
              <div className="pointer-events-auto">
                <NavigationMenuToggle 
                  toggle={() => setIsOpen(!isOpen)} 
                  isOpen={isOpen} 
                />
              </div>
          </motion.div>

          <motion.div
             key="mobile-footer-blur"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.3 }}
             className={cn(
               "absolute bottom-0 left-0 w-full h-28 z-40", // z-40 (di atas konten, di bawah tombol)
               "backdrop-blur-md xs:rounded-bl-2xl", // Efek blur kaca
               // Gradient agar blur-nya memudar halus ke bawah (tidak patah kotak)
               "[mask-image:linear-gradient(to_top,black_50%,transparent_100%)]",
               // Opsional: Sedikit background warna agar teks di belakang benar-benar tidak terbaca
               "bg-linear-to-r/oklch from-primary-600/2.5 to-secondary-600/2.5"
             )}
          />

          <motion.div
            key="mobile-btn-login"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-6 left-0 w-full px-6 z-50"
          >
            <ShineButton 
                label="Login" 
                size="sm" 
                className="w-full"
                bgColor="linear-gradient(325deg, var(--color-primary) 0%, var(--color-secondary) 55%, var(--color-primary) 90%)" 
                onClick={() => alert('Thanks for your support!')} 
            />
          </motion.div>
        </>
      )}
    </motion.nav>
  )
};

export const config: ConfigIsland = { mode: "interactive", createShortcode: false };

const Brainwave = ({Menus=[], Params={}}: IslandProps) => {
   const cleanMenus = mapHugoMenuEntry(Menus);
   const cleanParams = keysToCamel(Params);
   const logoConfig = cleanParams.header?.logo;

   const [isScolling, setIsScrolling] = useState(false);

   useEffect(() => {
      const handleScroll = () => {
        const scrollPosition = Math.max(0, window.scrollY);
        if (scrollPosition > 10) {
          setIsScrolling(true);
        } else {
          setIsScrolling(false);
        }
      }
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
         window.removeEventListener("scroll", handleScroll);
      };
   }, []);


   return (
      <header className={cn(
        "fixed w-full rounded-lg flex items-center md:justify-between md:px-8 lg:px-16 bg-linear-to-r/oklch z-50 transition-all duration-300",
        isScolling 
          ? "py-2 from-primary-600/5 to-secondary-600/5 text-netral-50 backdrop-blur-sm" 
          : "py-4 from-primary-600 to-secondary-600 text-primary-100"
      )}>
        {/* Logo */}
        <a href={logoConfig?.href || "#"} class="z-50">
          <Dispatcher config={logoConfig}/>
        </a>

        <ResponsiveNavigation Menus={cleanMenus}/>

         <div className="hidden items-center px-2 md:flex">
            <ToggleTheme/>
            <ShineButton 
               label="Login" 
               size="sm" 
               bgColor="linear-gradient(325deg, var(--color-primary) 0%, var(--color-secondary) 55%, var(--color-primary) 90%)" 
               onClick={() => alert('Thanks for your support!')} 
            />
         </div>
      </header>
   );
};

export default Brainwave;