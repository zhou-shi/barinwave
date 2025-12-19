import { h } from "preact"
import { BorderBeam } from "@/components/lightswind/border-beam";
import BrainAI from "@/components/spline/brain-ai";
import PrimaryLogo  from "assets/ts/components/logos/PrimaryLogo";

const Basic = () => {
   return (
      <header className="relative p-1 rounded-lg overflow-hidden">
         <div className="h-16 w-64 relative rounded-lg py-10 px-1.5 flex items-center justify-around">
            <BorderBeam />
            <div className="basis-1/6 flex justify-center items-center">
               <BrainAI />
            </div>
           <div className="basis-11/12 flex items-center">
               <h1 className="text-3xl font-bold font-sans">Brainwave</h1>
           </div>
         </div>
      </header>
  );
};

export default Basic;