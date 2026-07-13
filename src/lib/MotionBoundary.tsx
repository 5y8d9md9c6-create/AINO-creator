import type { ReactNode } from "react";
import { LazyMotion } from "./motion";

type MotionBoundaryProps = {
  children: ReactNode;
};

export default function MotionBoundary({ children }: MotionBoundaryProps) {
  return (
    <LazyMotion
      strict
      features={() =>
        import("./motion-features").then((module) => module.default)
      }
    >
      {children}
    </LazyMotion>
  );
}
