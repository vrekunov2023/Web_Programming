import { NoiseSensor } from './models/NoiseSensor.js';
import { MonitoringSystem } from './services/MonitoringSystem.js';

// Пороги з лабораторної №5: normal ≤ 55, warning ≤ 70, critical > 70.
const sensorsData = [
  { id: 'NS-01', district: 'Галицький', location: 'просп. Свободи, 14', noiseLevel: 52 },
  { id: 'NS-02', district: 'Франківський', location: 'вул. Наукова, 8', noiseLevel: 68 },
  { id: 'NS-03', district: 'Шевченківський', location: 'просп. Чорновола, 21', noiseLevel: 83 },
  { id: 'NS-04', district: 'Сихівський', location: 'вул. Зелена, 102', noiseLevel: 49 },
  { id: 'NS-05', district: 'Личаківський', location: 'вул. Пасічна, 30', noiseLevel: 69 },
  { id: 'NS-06', district: 'Залізничний', location: 'вул. Городоцька, 155', noiseLevel: 86 },
];
const system = new MonitoringSystem();
sensorsData.map(NoiseSensor.fromObject).forEach(sensor => system.addSensor(sensor));
const sensors = system.sensors;

const sensorList = document.querySelector('.sensor-list');
const districtFilter = document.querySelector('#district-filter');
const criticalFilter = document.querySelector('#critical-filter');

// Локальні декоративні іконки, без зовнішніх бібліотек.
function createIcon(name) {
  const paths = {
    pin: ['M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z', 'M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
    building: ['M4 22V6h10v16M14 10h6v12M2 22h20M7 9h1M10 9h1M7 13h1M10 13h1M7 17h1M10 17h1M17 13h1M17 17h1M8 22v-2h3v2'],
    sound: ['M3 10v4M7 6v12M12 2v20M17 6v12M21 10v4'],
  };
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('class', 'sensor-card__icon');
  icon.setAttribute('aria-hidden', 'true');
  paths[name].forEach(data => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', data);
    icon.append(path);
  });
  return icon;
}

function createSensorCard(sensor) {
  const status = sensor.getStatus();
  const card = document.createElement('article');
  card.classList.add('sensor-card', `sensor-card--${status}`);
  const header = document.createElement('div');
  header.classList.add('sensor-card__header');
  const title = document.createElement('h3');
  title.classList.add('sensor-card__id');
  title.textContent = sensor.id;
  const badge = document.createElement('span');
  badge.classList.add('sensor-card__badge', `sensor-card__badge--${status}`);
  badge.textContent = status;
  header.append(title, badge);
  const district = document.createElement('p');
  district.classList.add('sensor-card__district');
  district.append(createIcon('pin'), `${sensor.district} район`);
  const location = document.createElement('p');
  location.classList.add('sensor-card__location');
  location.append(createIcon('building'), sensor.location);
  const level = document.createElement('p');
  level.classList.add('sensor-card__level');
  const value = document.createElement('strong');
  value.textContent = `${sensor.noiseLevel} дБ`;
  level.append(createIcon('sound'), 'Рівень шуму: ', value);
  card.append(header, district, location, level);
  return card;
}

function renderSensors(sensorArray) {
  sensorList.replaceChildren();
  sensorArray.forEach(sensor => sensorList.append(createSensorCard(sensor)));
}

function applyFilters() {
  const selectedDistrict = districtFilter.value;
  const criticalOnly = criticalFilter.checked;
  const filteredSensors = sensors.filter(sensor => {
    const matchesDistrict = selectedDistrict === 'all' || sensor.district === selectedDistrict;
    const matchesStatus = !criticalOnly || sensor.getStatus() === 'critical';
    return matchesDistrict && matchesStatus;
  });
  renderSensors(filteredSensors);
}

districtFilter.addEventListener('change', applyFilters);
criticalFilter.addEventListener('change', applyFilters);
renderSensors(sensors);
