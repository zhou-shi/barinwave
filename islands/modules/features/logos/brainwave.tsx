import { cn } from "@/modules/lib/utils";
import { BorderBeam } from "@/modules/lightswind/ui/border-beam";
import { VideoText } from "@/modules/lightswind/ui/video-text";
import Scene, { SceneProps } from "@/modules/spline/scene";
import { h } from "preact";

export interface BrainwaveProps extends Omit<SceneProps, "className"> {
    beamSize?: number;
    videoFontSize?: number | string;
    videoFontWeight?: number;
    videoSrc?: string;
    title?: string;
    sceneClassName?: string;
    brainwaveClassName?: string;
};

const Brainwave = ({
    beamSize=50, 
    videoFontSize="1.125rem", 
    videoFontWeight=800, 
    videoSrc="videos/girl.mp4",
    sceneUrl,
    sceneClassName,
    brainwaveClassName,
    title="BRAINWAVE"
}: BrainwaveProps) => {
  return (
    <div className={cn(
        "h-12 w-[clamp(16rem,80%,32rem)] relative rounded-lg py-8 px-1.5 flex items-center justify-around ", 
        brainwaveClassName
    )}>
        <BorderBeam 
            size={beamSize} 
            pauseOnHover={true} 
            colorFrom="var(--color-primary-600)"
            colorTo="var(--color-secondary-600)"
        />
        <div className="basis-1/6 flex justify-center items-center size-16">
            <Scene sceneUrl={sceneUrl} className={sceneClassName} />
        </div>
        <div className="basis-11/12 flex items-center h-12">
            <VideoText
                src={videoSrc}
                fontSize={videoFontSize}
                fontWeight={videoFontWeight}
                fontFamily="Arial Black, sans-serif"
                className="w-full h-full"
                autoPlay
                muted
                loop
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                {title}
            </VideoText>
        </div>
    </div>
  );
};

export default Brainwave