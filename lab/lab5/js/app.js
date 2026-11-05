// ============================================================
//  app.js — ініціалізація та інтеграція з вебсторінкою
// ============================================================

import { NoiseSensor, NOISE_LIMITS } from './models/NoiseSensor.js';
import { NoiseMeasurement }          from './models/NoiseMeasurement.js';
import { MonitoringSystem }          from './services/MonitoringSystem.js';
import { MobileNoiseSensor }         from './models/MobileNoiseSensor.js';

// ---- Початкові дані (з методички) ----
const sensorsData = [
  { id: 'NS-01', district: 'Галицький',      location: 'просп. Свободи',   noiseLevel: 58 },
  { id: 'NS-02', district: 'Франківський',   location: 'вул. Наукова',     noiseLevel: 74 },
  { id: 'NS-03', district: 'Шевченківський', location: 'просп. Чорновола', noiseLevel: 83 },
];

// ---- Перетворення plain objects на екземпляри через static fromObject ----
const system = new MonitoringSystem();
sensorsData.map(NoiseSensor.fromObject).forEach(s => system.addSensor(s));

// Мобільний датчик (наслідування)
const mobile = new MobileNoiseSensor('NS-M1', 'Галицький', 'пл. Ринок', 50, 15);
system.addSensor(mobile);


// ============================================================
//  Консольні експерименти (розділ 7.1 методички)
// ============================================================
console.group('🔬 Експерименти з prototype і власними властивостями');

const sensorA = system.findSensorById('NS-01');
const sensorB = system.findSensorById('NS-02');

// Прогноз: true — обидва екземпляри посилаються на один метод з prototype
console.log('sensorA.getStatus === sensorB.getStatus →', sensorA.getStatus === sensorB.getStatus);

// Прогноз: true — noiseLevel записано в constructor через this
console.log('Object.hasOwn(sensorA, "noiseLevel") →', Object.hasOwn(sensorA, 'noiseLevel'));

// Прогноз: false — getStatus знаходиться в NoiseSensor.prototype, а не в екземплярі
console.log('Object.hasOwn(sensorA, "getStatus") →',  Object.hasOwn(sensorA, 'getStatus'));

console.groupEnd();


// ============================================================
//  Консольний звіт системи
// ============================================================
console.group('📊 Акустична варта — стан системи моніторингу');

console.log(`Межі класифікації: normal ≤ ${NOISE_LIMITS.normalMax} dB | warning ≤ ${NOISE_LIMITS.warningMax} dB | critical > ${NOISE_LIMITS.warningMax} dB`);

console.table(system.sensors.map(s => ({
  ID:      s.id,
  Район:   s.district,
  Адреса:  s.location,
  'Шум dB': s.noiseLevel,
  Статус:  s.getStatus(),
})));

const avg = system.getAverageNoiseLevel();
console.log(`Середній рівень шуму: ${avg !== null ? avg.toFixed(2) : 'н/д'} dB`);

const critical = system.getCriticalSensors();
console.warn(`⚠️  Критичних датчиків: ${critical.length} →`, critical.map(s => s.id));

const galych = system.getSensorsByDistrict('Галицький');
console.log(`Датчики «Галицький»: ${galych.length} →`, galych.map(s => s.id));

console.groupEnd();


// ============================================================
//  Демонстрація addMeasurement та updateNoiseLevel
// ============================================================
console.group('🔄 Оновлення рівня через NoiseMeasurement');

const ns01 = system.findSensorById('NS-01');
console.log('NS-01 до:', ns01.noiseLevel, 'dB →', ns01.getStatus());

const m = new NoiseMeasurement(78);
console.log('Вимірювання:', m.toString(), '| isValid:', m.isValid());
ns01.addMeasurement(m);

console.log('NS-01 після:', ns01.noiseLevel, 'dB →', ns01.getStatus());
console.log('Кількість вимірювань:', ns01.measurements.length);

console.groupEnd();


// ============================================================
//  Рендеринг карток на сторінці
// ============================================================

function renderSensorCard(sensor) {
  const status = sensor.getStatus();
  const card   = document.createElement('article');
  card.className = `sensor-card sensor-card--${status}`;

  card.innerHTML = `
    <div class="sensor-card__header">
      <span class="sensor-card__id">${sensor.id}</span>
      <span class="sensor-card__badge sensor-card__badge--${status}">${statusLabel(status)}</span>
    </div>
    <div class="sensor-card__district">${sensor.district}</div>
    <div class="sensor-card__location">${sensor.location}</div>
    <div class="sensor-card__level">${sensor.noiseLevel} dB</div>
  `;
  return card;
}

function statusLabel(status) {
  return { normal: 'Норма', warning: 'Увага', critical: 'Критично' }[status] ?? status;
}

function renderAll() {
  const container = document.getElementById('sensors-grid');
  if (!container) return;
  container.innerHTML = '';
  system.sensors.forEach(s => container.appendChild(renderSensorCard(s)));
}

document.addEventListener('DOMContentLoaded', renderAll);
