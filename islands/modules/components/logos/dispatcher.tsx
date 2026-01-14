import HotodusLogo, { HotodusProps } from "./hotodus";
import BrainwaveLogo, { BrainwaveProps } from "./brainwave";
import { ConfigIsland } from "@/modules/types";

interface HotodusLogoProps extends Omit<HotodusProps, "className"> {
  variant: "hotodus";
  hotodusClassName?: string;
  splineUrl?: never; 
}

interface BrainwaveLogoProps extends BrainwaveProps {
  variant: "brainwave";
  imgUrl?: never;
  imgAlt?: never;
}

export const config: ConfigIsland = {build: false};

export type LogoConfig = HotodusLogoProps | BrainwaveLogoProps;

export const Dispatcher = ({ config }: { config: LogoConfig | undefined | null }) => {
    if (!config) return null;

    switch (config.variant) {
        case "brainwave":
            return (
              <BrainwaveLogo
                sceneUrl={config.sceneUrl} 
                title={config.title} 
                beamSize={config.beamSize}
                brainwaveClassName={config.brainwaveClassName}
                sceneClassName={config.sceneClassName}
                videoSrc={config.videoSrc}
                videoFontSize={config.videoFontSize}
                videoFontWeight={config.videoFontWeight}
              />
            );
        case "hotodus":
            return (
              <HotodusLogo 
                title={config.title} 
                imgUrl={config.imgUrl} 
                className={config.hotodusClassName}
              />
            );
        default:
            return null; // Fallback jika varian tidak dikenali
    }
};