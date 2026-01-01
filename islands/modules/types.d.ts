declare global {
    interface Window {
        requestIslands?: IslandRequest[];
    }
};

export type IslandRequest = {
    component: string;
    targetId: string;
    dataId?: string;
};

export interface IslandMenuParams {
    description?: string;
    decoration?: string;
    icon?: string;
    [key: string]: any;
};

export interface IslandProps {
    Menus?: HugoMenuEntry[];
    Params?: HugoParamsEntry;
};

export interface HugoMenuEntry  {
  Identifier?: string;
  Parent?: string;
  Name?: string;
  Pre?: string;
  Post?: string; 
  URL?: string;
  PageRef? : string;
  Weight?: number;
  Title?: string;
  Params?: IslandMenuParams;
  Menu?: string;
  ConfiguredURL?: string;
  Page?: any;
  Children?: HugoMenuEntry[];
}

export interface HugoParamsEntry {
    islands?: Record<string, any>;
    [key: string]: any;
}

export {};