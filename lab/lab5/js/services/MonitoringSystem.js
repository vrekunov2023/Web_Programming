// ============================================================
//  MonitoringSystem — керує колекцією датчиків NoiseSensor
// ============================================================

import { NoiseSensor } from '../models/NoiseSensor.js';

export class MonitoringSystem {
  constructor() {
    this.sensors = [];
  }

  addSensor(sensor) {
    if (!(sensor instanceof NoiseSensor)) {
      throw new Error("Можна додавати лише об'єкти NoiseSensor");
    }
    if (this.sensors.some(s => s.id === sensor.id)) {
      throw new Error(`Датчик ${sensor.id} вже існує`);
    }
    this.sensors.push(sensor);
  }

  findSensorById(id) {
    return this.sensors.find(s => s.id === id) ?? null;
  }

  getSensorsByDistrict(district) {
    return this.sensors.filter(s => s.district === district);
  }

  getCriticalSensors() {
    // Використовуємо sensor.getStatus() — не дублюємо межі 55/70
    return this.sensors.filter(s => s.getStatus() === 'critical');
  }

  getAverageNoiseLevel() {
    if (this.sensors.length === 0) return null;
    const sum = this.sensors.reduce((acc, s) => acc + s.noiseLevel, 0);
    return sum / this.sensors.length;
  }
}
