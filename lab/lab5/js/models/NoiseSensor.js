// ============================================================
//  NoiseSensor — фізичний датчик шуму в конкретній точці міста
// ============================================================

export const NOISE_LIMITS = Object.freeze({
  normalMax:  55,
  warningMax: 70,
});

export class NoiseSensor {
  constructor(id, district, location, noiseLevel) {
    this.id           = id;
    this.district     = district;
    this.location     = location;
    this.noiseLevel   = noiseLevel;
    this.measurements = [];   // NoiseMeasurement[]
  }

  // --- Поведінка ---

  getStatus() {
    if (this.noiseLevel <= NOISE_LIMITS.normalMax)  return 'normal';
    if (this.noiseLevel <= NOISE_LIMITS.warningMax) return 'warning';
    return 'critical';
  }

  updateNoiseLevel(value) {
    if (!NoiseSensor.isValidNoiseLevel(value)) {
      throw new Error(`Некоректний рівень шуму: ${value}`);
    }
    this.noiseLevel = value;
  }

  addMeasurement(measurement) {
    this.measurements.push(measurement);
    this.updateNoiseLevel(measurement.value);
  }

  // --- Static ---

  static isValidNoiseLevel(value) {
    return Number.isFinite(value) && value >= 0 && value <= 200;
  }

  static fromObject(data) {
    if (!data.id || !data.district || !data.location) {
      throw new Error('Відсутні обовʼязкові поля для створення NoiseSensor');
    }
    return new NoiseSensor(data.id, data.district, data.location, data.noiseLevel ?? 0);
  }
}
