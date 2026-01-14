import Spline from '@splinetool/react-spline';

export interface SceneProps {
  sceneUrl?: string;
  className?: string;
}

export default function Scene({ sceneUrl="https://prod.spline.design/XzWmp-uI3N9d662r/scene.splinecode", className="" }: SceneProps) {
  return (
    <Spline scene={sceneUrl} className={className} />
  );
}
