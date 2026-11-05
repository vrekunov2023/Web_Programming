// ============================================================
//  NoiseMeasurement — одне вимірювання рівня шуму
// ============================================================

const MIN_VALID = 0;
const MAX_VALID = 200;

export class NoiseMeasurement {
  constructor(value) {
    this.value      = value;
    this.measuredAt = new Date();
  }

  isValid() {
    return Number.isFinite(this.value)
      && this.value >= MIN_VALID
      && this.value <= MAX_VALID;
  }

  toString() {
    return `${this.value} dB (${this.measuredAt.toLocaleTimeString('uk-UA')})`;
  }
}
