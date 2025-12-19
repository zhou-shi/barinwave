import { h } from "preact";
import Spline from "@splinetool/react-spline";

export default function BrainAI() {
  return (
    <div className="h-40 w-20 overflow-hidden flex justify-center items-center">
      <div className="size-40 overflow-hidden flex justify-center items-center">
        <div className="size-72 rounded-full relative -top-3.5">
            <Spline scene="https://prod.spline.design/nGs82-D61fKK2zsY/scene.splinecode" />
        </div>
      </div>
    </div>
  );
}
