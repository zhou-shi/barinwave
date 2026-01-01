import { cn } from "@/modules/lib/utils";
import * as Collapsible from "@radix-ui/react-collapsible";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDownIcon } from "lucide-react";
import { ComponentType, h } from "preact";
import { useState } from "preact/hooks";
import { NavigationMenuItems } from "../features/header/types";

export const MenuItemLayout = ({ 
  title, 
  description, 
  icon: Icon, 
  hasChildren, 
  isOpen 
}: { 
  title: string, 
  description?: string, 
  icon?: ComponentType<{className?: string}>, 
  hasChildren?: boolean, 
  isOpen?: boolean 
}) => (
  <div className="flex items-center gap-3 w-full text-left">
    {Icon && 
      <div className="shrink-0 text-primary-950 mt-0.5">
        <Icon className="size-5" />
      </div>
    }

    <div className="flex flex-col flex-1 gap-0.5">
      <span className={cn(
          "text-base font-medium leading-none", 
          isOpen ? "text-primary-950" : "text-foreground"
      )}>
        {title}
      </span>
      
      {description && (
        <span className="text-sm text-muted-foreground line-clamp-2 leading-snug">
          {description}
        </span>
      )}
    </div>

    {hasChildren && (
        <ChevronDownIcon 
          className="size-5 text-muted-foreground shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)]"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} 
      />
    )}
  </div>
);

export const MobileMenuItem = ({ item, onLinkClick }: { item: NavigationMenuItems, onLinkClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <a 
        href={item.href || "#"}
        className="block py-3 px-4 text-lg font-medium text-foreground hover:bg-primary-50 rounded-md transition-colors"
        onClick={onLinkClick}
      >
        <MenuItemLayout 
          title={item.title} 
          description={item.description} 
          icon={item.icon} 
        />
      </a>
    );
  }

  return (
    <Collapsible.Root 
      open={isOpen} 
      onOpenChange={setIsOpen} 
      className="w-full"
    >
      <Collapsible.Trigger className={cn(
        "w-full py-3 px-4 rounded-md transition-colors outline-none",
        "hover:bg-primary-50/50 focus-visible:bg-primary-50",
        isOpen ? "bg-primary-50/50" : "" 
      )}>
        <MenuItemLayout 
            title={item.title} 
            description={item.description}
            icon={item.icon}
            hasChildren={true}
            isOpen={isOpen}
        />
      </Collapsible.Trigger>

      <AnimatePresence initial={false}>
        {isOpen && (
          <Collapsible.Content forceMount asChild>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <ul className="flex flex-col gap-1 pl-4 pr-2 pb-2 ml-[1.1rem] border-l-2 border-primary-100/50 mt-1">
                {item.children?.map((child, idx) => (
                  <li key={idx}>
                    <a 
                      href={child.href || "#"} 
                      className="block py-2.5 px-3 rounded-md transition-colors hover:bg-primary-50/50 active:bg-primary-100"
                      onClick={onLinkClick}
                    >
                      <MenuItemLayout 
                        title={child.title} 
                        description={child.description}
                        icon={child.icon}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </Collapsible.Content>
        )}
      </AnimatePresence>
    </Collapsible.Root>
  );
};