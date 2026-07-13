import { CurveArrow, CursorHand, DownArrow, PushArrow, RollArrow, ShakeLines } from "../components/Doodles";
import "./annotations.css";

export function PushLabel() {
  return (
    <div className="letter-annotation letter-annotation--push">
      <span className="letter-annotation__word">Push!</span>
      <PushArrow className="letter-annotation__icon letter-annotation__icon--push" />
    </div>
  );
}

export function PushCursor() {
  return <CursorHand className="letter-annotation__cursor" />;
}

export function DownLabel() {
  return (
    <div className="letter-annotation letter-annotation--down">
      <span className="letter-annotation__word">Down!</span>
      <DownArrow className="letter-annotation__icon letter-annotation__icon--down" />
    </div>
  );
}

export function ShakeLabel() {
  return (
    <div className="letter-annotation letter-annotation--shake">
      <ShakeLines className="letter-annotation__icon letter-annotation__icon--shake-left" />
      <span className="letter-annotation__word">Shake!</span>
      <ShakeLines className="letter-annotation__icon letter-annotation__icon--shake-right" />
    </div>
  );
}

export function RollLabel() {
  return (
    <div className="letter-annotation letter-annotation--roll">
      <span className="letter-annotation__word">Roll!</span>
      <CurveArrow className="letter-annotation__icon letter-annotation__icon--roll" />
    </div>
  );
}

export { CurveArrow, CursorHand, DownArrow, PushArrow, RollArrow, ShakeLines };
