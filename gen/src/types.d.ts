type RequestHyadration = {
    component: string;
    targetId: string;
    dataId?: string;
}

interface Window {
    requestHydration?: RequestHyadration[];
}