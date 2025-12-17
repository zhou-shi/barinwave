import { Navigation } from "@/components/Navigation";
import {h, FunctionalComponent, hydrate, render } from "preact";

const COMPONENT_MAP: Record<string, FunctionalComponent<any>> = {
    "RadixNavigation": Navigation,
};


const init = () => {
    const queue = (window as any).requestHydration || [];

    queue.forEach((req: any) => {
        const { component, targetId, dataId } = req;

        const Component = COMPONENT_MAP[component];
        const root = document.getElementById(targetId);
        const dataScript = document.getElementById(dataId);

        if (Component && root && dataScript) {
            try {
                const rawData = JSON.parse(dataScript.textContent || '{}'); 
                const props = Array.isArray(rawData) ? { items: rawData } : rawData;

                root.innerHTML = '';

                render(<Component {...props} />, root);
            } catch (err) {   
                console.error(`❌ Error rendering ${component}:`, err);
            }
        }
    });
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}