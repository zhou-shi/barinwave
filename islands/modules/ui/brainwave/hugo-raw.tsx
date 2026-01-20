import { ConfigIsland } from "@/modules/types";

export const config: ConfigIsland = { mode: "static", build: false, name: "components/hugo-raw" };

export const HugoRaw = ({ code }: { code: string }) => (
    <span dangerouslySetInnerHTML={{ __html: code }} />
);