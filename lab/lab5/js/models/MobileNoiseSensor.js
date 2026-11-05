// ============================================================
//  MobileNoiseSensor — мобільний різновид датчика (наслідування)
// ============================================================

import { NoiseSensor } from './NoiseSensor.js';

export class MobileNoiseSensor extends NoiseSensor {
  constructor(id, district, location, noiseLevel, batteryLevel) {
    super(id, district, location, noiseLevel); // ініціалізує батьківський стан
    this.batteryLevel = batteryLevel;          // власний стан підкласу
  }

  needsCharging() {
    return this.batteryLevel < 20;
  }

  getStatus() {
    const base = super.getStatus();
    // Мобільний датчик з розрядженою батареєю завжди сигналізує warning
    if (this.needsCharging() && base === 'normal') return 'warning';
    return base;
  }
}
