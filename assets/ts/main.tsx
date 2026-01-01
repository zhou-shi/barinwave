import BasicHeader from "@/modules/features/header/hotodus";
import BarinwaveHeader from "@/modules/features/header/brainwave";
import { HugoMenuEntry, HugoParamsEntry, IslandProps } from "@/modules/types";
import {h, FunctionalComponent, render } from "preact";

const COMPONENT_MAP: Record<string, FunctionalComponent<IslandProps>> = {
    "BasicHeader": BasicHeader,
    "BrainwaveHeader": BarinwaveHeader,

};


const init = () => {
    const queue = window.requestIslands || [];

    queue.forEach((req) => {
        const { component, targetId, dataId } = req;

        const Component = COMPONENT_MAP[component];
        const root = document.getElementById(targetId);
        const dataScript = dataId ? document.getElementById(dataId) : null;

        if (Component && root) {
            try {
                root.innerHTML = '';

                let props: IslandProps = {
                    Menus: [],
                    Params: {}
                };

                if (dataScript) {
                    const rawData = JSON.parse(dataScript.textContent || 'null'); 

                    if (rawData) {
                        if (Array.isArray(rawData)) {
                            props.Menus = rawData as HugoMenuEntry[];
                        } else if (typeof rawData === 'object') {
                            const hasMenuKey = 'Menus' in rawData;
                            const hasParamsKey = 'Params' in rawData;

                            if (hasMenuKey || hasParamsKey) {
                                props.Menus = rawData.Menus as HugoMenuEntry[] || [];
                                props.Params = rawData.Params as HugoParamsEntry || {};
                            } else {
                                props.Params = rawData as HugoParamsEntry;
                            }
                        } 
                    }
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