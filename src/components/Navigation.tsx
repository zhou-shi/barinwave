import { CaretDownIcon } from '@radix-ui/react-icons';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import clsx from 'clsx';
import { h, Fragment } from 'preact';

type HugoMenuEntry = {
  Name: string;
  URL: string;
  Children?: HugoMenuEntry[] | null;
  Params?: {
    description?: string;
  } | null;
  Identifier?: string;
};

export type MenuItem = {
    label: string;
    url? : string;
    description?: string;
    children?: MenuItem[];
}

const mapHugo = (entry: HugoMenuEntry[]): MenuItem[] => {
    if (!entry || !Array.isArray(entry)) return [];
    
    return entry.map(e => ({
        label: e.Name,
        url: e.URL,
        description: e.Params?.description || "",
        children: e.Children ? mapHugo(e.Children) : [],
    }));
};

export const Navigation = ({items, className}: {items: HugoMenuEntry[], className?: string}) => {
    const cleanItems = mapHugo(items);

    return (
        <NavigationMenu.Root className={clsx("", className)}>
            <NavigationMenu.List className="">
                {cleanItems.map((item, index) => (
                    <NavigationMenu.Item key={index}>
                        
                        {/* KASUS 1: Punya Anak (Dropdown) */}
                        {item.children && item.children.length > 0 ? (
                        <>
                            <NavigationMenu.Trigger className="">
                            {item.label}
                            <CaretDownIcon className="" aria-hidden />
                            </NavigationMenu.Trigger>
                            
                            <NavigationMenu.Content className="">
                            <ul className="">
                                {item.children.map((child, childIdx) => (
                                <li key={childIdx} className="">
                                    <NavigationMenu.Link href={child.url} className="">
                                    <div className="">{child.label}</div>
                                    <p className="">Deskripsi singkat jika ada...</p>
                                    </NavigationMenu.Link>
                                </li>
                                ))}
                            </ul>
                            </NavigationMenu.Content>
                        </>
                        ) : (
                        /* KASUS 2: Link Biasa */
                        <NavigationMenu.Link className="" href={item.url}>
                            {item.label}
                        </NavigationMenu.Link>
                        )}

                    </NavigationMenu.Item>
                ))}

                <NavigationMenu.Indicator className="">
                <div className="" />
                </NavigationMenu.Indicator>
            </NavigationMenu.List>
            <div className="">
                <NavigationMenu.Viewport className="" />
            </div>
        </NavigationMenu.Root>
    );
};