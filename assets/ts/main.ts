import { hydrateIslands } from "@/core/hydrator";

// Fungsi inisialisasi utama
const init = async () => {
    await hydrateIslands();
};

// Jalankan saat browser siap
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}








// import { HugoMenuEntry, IslandProps } from "@/modules/types";
// import { render } from "preact";
// import { COMPONENT_LOADERS } from "./client-manifest";


// // ASYNC karena import() butuh waktu (await)
// const init = async () => {
//     const queue = window.requestIslands || [];

//     // Gunakan for ..of agar bisa await di dalam loop
//     for (const req of queue) {
//         const { component, targetId, dataId } = req;
//         const root = document.getElementById(targetId);

//         // Cek apakah loader tersedia
//         const loader = COMPONENT_LOADERS[component];

//         if (loader && root) {
//             try {
//                 // DOWNLOAD SCRIPT SAAT DIPERLUKAN SAJA (Lazy Load)
//                 // Browser baru akan request file JS komponen di baris ini
//                 const module = await loader();

//                 const Component = module.default;
//                 // Ambil data dari <script> jika ada sebelum konten dihancurkan
//                 const dataScript = dataId ? document.getElementById(dataId) : null;
//                 // Hancurkan konten
//                 root.innerHTML = '';

//                 let props: IslandProps = {Menus: [], Params: {}};

//                 if (dataScript) {
//                     const rawData = JSON.parse(dataScript.textContent || 'null'); 
//                     if (rawData) {
//                         if (Array.isArray(rawData)) {
//                             props.Menus = rawData as HugoMenuEntry[];
//                         } else if (typeof rawData === 'object') {
//                             const hasMenuKey = 'Menus' in rawData;
//                             const hasParamsKey = 'Params' in rawData;
//                             const hasDataKey = 'Data' in rawData;
//                             const hasPageKey = 'Page' in rawData;
//                             if (hasMenuKey || hasParamsKey || hasDataKey || hasPageKey) {
//                                 props.Menus = rawData.Menus as HugoMenuEntry[] || [];
//                                 props.Params = rawData.Params as Pick<IslandProps, "Params"> || {};
//                                 props.Data = rawData.Data as Pick<IslandProps, "Data"> || {};
//                                 props.Page = rawData.Page as Pick<IslandProps, "Page"> || {};
//                             } else {
//                                 props.Params = rawData as Pick<IslandProps, "Params">;
//                             }
//                         } 
//                     }
//                 } 

//                 render(<Component {...props} />, root);

//             } catch (err) {
//                 console.error(`❌ Error rendering ${component}:`, err);
//             }
//         }
//     }
// };

// if (document.readyState === "loading") {
//     document.addEventListener("DOMContentLoaded", init);
// } else {
//     init();
// }