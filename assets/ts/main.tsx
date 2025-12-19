import Header from "@/components/brainwave/header/Basic";
import { BorderBeam } from "@/components/lightswind/border-beam";
import { Navigation } from "@/components/radix/navigation";
import {h, FunctionalComponent, render } from "preact";

const COMPONENT_MAP: Record<string, FunctionalComponent<any>> = {
    "RadixNavigation": Navigation,
    "BorderBeam": BorderBeam,
    "Header": Header
};


const init = () => {
    const queue = window.requestHydration || [];

    queue.forEach((req) => {
        const { component, targetId, dataId } = req;

        const Component = COMPONENT_MAP[component];
        const root = document.getElementById(targetId);
        const dataScript = dataId ? document.getElementById(dataId) : null;

        if (Component && root) {
            try {
                root.innerHTML = '';

                if (dataScript) {
                    const rawData = JSON.parse(dataScript.textContent || '{}'); 
                    const props = Array.isArray(rawData) ? { props: rawData } : rawData;


                    console.log(Array.isArray(rawData));

                    console.log(rawData);
                    console.log(props);

                    render(<Component {...props} />, root);
                } else {
                    render(<Component />, root);
                }

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