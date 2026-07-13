import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ContactPlanePhase = "idle" | "flying" | "landed";
export type FlightIntent = "navigate" | "submit" | "returnHero";

type Origin = { x: number; y: number };

type ContactPlaneContextValue = {
  phase: ContactPlanePhase;
  origin: Origin | null;
  flightIntent: FlightIntent | null;
  flightSeed: number;
  landedViaPlane: boolean;
  submitMailto: string | null;
  launch: (origin: Origin) => void;
  launchSubmit: (origin: Origin, mailto: string) => void;
  launchReturnHero: (origin: Origin) => void;
  completeFlight: () => void;
  completeSubmit: () => void;
  completeReturnHero: () => void;
  reset: () => void;
};

const ContactPlaneContext = createContext<ContactPlaneContextValue | null>(null);

export function ContactPlaneProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<ContactPlanePhase>("idle");
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [flightIntent, setFlightIntent] = useState<FlightIntent | null>(null);
  const [flightSeed, setFlightSeed] = useState(() => Math.random());
  const [landedViaPlane, setLandedViaPlane] = useState(false);
  const [submitMailto, setSubmitMailto] = useState<string | null>(null);

  const launch = useCallback((nextOrigin: Origin) => {
    window.dispatchEvent(new CustomEvent("aino:request-contact-mount"));
    setLandedViaPlane(false);
    setSubmitMailto(null);
    setFlightIntent("navigate");
    setFlightSeed(Math.random());
    setOrigin(nextOrigin);
    setPhase("flying");
  }, []);

  const launchSubmit = useCallback((nextOrigin: Origin, mailto: string) => {
    setSubmitMailto(mailto);
    setFlightIntent("submit");
    setFlightSeed(Math.random());
    setOrigin(nextOrigin);
    setPhase("flying");
  }, []);

  const completeFlight = useCallback(() => {
    setLandedViaPlane(true);
    setPhase("landed");
    setFlightIntent(null);
    setSubmitMailto(null);
  }, []);

  const launchReturnHero = useCallback((nextOrigin: Origin) => {
    setLandedViaPlane(false);
    setSubmitMailto(null);
    setFlightIntent("returnHero");
    setFlightSeed(Math.random());
    setOrigin(nextOrigin);
    setPhase("flying");
  }, []);

  const completeSubmit = useCallback(() => {
    setPhase("idle");
    setOrigin(null);
    setFlightIntent(null);
    setSubmitMailto(null);
  }, []);

  const completeReturnHero = useCallback(() => {
    setPhase("idle");
    setOrigin(null);
    setFlightIntent(null);
    setSubmitMailto(null);
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setOrigin(null);
    setFlightIntent(null);
    setFlightSeed(Math.random());
    setLandedViaPlane(false);
    setSubmitMailto(null);
  }, []);

  const value = useMemo(
    () => ({
      phase,
      origin,
      flightIntent,
      flightSeed,
      landedViaPlane,
      submitMailto,
      launch,
      launchSubmit,
      launchReturnHero,
      completeFlight,
      completeSubmit,
      completeReturnHero,
      reset,
    }),
    [
      phase,
      origin,
      flightIntent,
      flightSeed,
      landedViaPlane,
      submitMailto,
      launch,
      launchSubmit,
      launchReturnHero,
      completeFlight,
      completeSubmit,
      completeReturnHero,
      reset,
    ],
  );

  return <ContactPlaneContext.Provider value={value}>{children}</ContactPlaneContext.Provider>;
}

export function useContactPlane() {
  const ctx = useContext(ContactPlaneContext);
  if (!ctx) {
    throw new Error("useContactPlane must be used within ContactPlaneProvider");
  }
  return ctx;
}
