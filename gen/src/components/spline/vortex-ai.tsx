import { h } from "preact";
import Spline from "@splinetool/react-spline";

export default function VortexAI() {
  return (
    <div className="h-40 w-20 overflow-hidden flex justify-center items-center">
      <div className="size-40 overflow-hidden flex justify-center items-center">
        <div className="size-72 rounded-full relative">
            <Spline scene="https://prod.spline.design/60u2r4J2C28DKMEV/scene.splinecode" />
        </div>
      </div>
    </div>
  );
}
