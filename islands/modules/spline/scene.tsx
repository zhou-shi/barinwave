import { h } from "preact";
import Spline from "@splinetool/react-spline";
import { cn } from "@/modules/lib/utils";

/**
 * Scene Component Brain https://prod.spline.design/nGs82-D61fKK2zsY/scene.splinecode
 * Scene Component Vortex https://prod.spline.design/60u2r4J2C28DKMEV/scene.splinecode
 * Scene Component Free https://prod.spline.design/reAn1UQOOP2t0Mjf/scene.splinecode
 **/ 
export interface SceneProps {
  sceneUrl?: string;
  className?: string;
}

export default function Scene({ sceneUrl="https://prod.spline.design/nGs82-D61fKK2zsY/scene.splinecode", className="" }: SceneProps) {
  return (
    <div className="h-40 w-20 overflow-hidden flex justify-center items-center">
      <div className="size-40 overflow-hidden flex justify-center items-center">
        <div className={cn("size-72 rounded-full relative", className)}>
            <Spline scene={sceneUrl} />
        </div>
      </div>
    </div>
  );
}
