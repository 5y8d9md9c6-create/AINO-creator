/** Minimal semi-implicit-Euler spring-damper used to drive every letter's physical reaction. */
const FIXED_STEP = 1 / 120;
const MAX_STEPS = 12;

export class ScalarSpring {
  value: number;
  velocity: number;
  target: number;

  constructor(initial = 0, target = initial) {
    this.value = initial;
    this.velocity = 0;
    this.target = target;
  }

  impulse(v: number) {
    this.velocity += v;
  }

  private step(dt: number, stiffness: number, damping: number) {
    const force = (this.target - this.value) * stiffness;
    this.velocity += force * dt;
    this.velocity *= Math.max(0, 1 - damping * dt);
    this.value += this.velocity * dt;
  }

  /**
   * Advances the spring by `dt` seconds using fixed-size sub-steps so the
   * result is correct regardless of the host's actual frame rate (a slow
   * or throttled renderer must not appear to play the animation in slow
   * motion, nor should a stalled tab cause a runaway simulation).
   */
  update(dt: number, stiffness: number, damping: number) {
    let remaining = Math.min(dt, FIXED_STEP * MAX_STEPS);
    let steps = 0;
    while (remaining > 0 && steps < MAX_STEPS) {
      const h = Math.min(FIXED_STEP, remaining);
      this.step(h, stiffness, damping);
      remaining -= h;
      steps += 1;
    }
    if (Math.abs(this.value - this.target) < 0.0002 && Math.abs(this.velocity) < 0.0006) {
      this.value = this.target;
      this.velocity = 0;
    }
  }
}
