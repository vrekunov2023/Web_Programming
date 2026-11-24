import { NOISE_LIMITS } from './models/NoiseSensor.js';
import { API_URL } from './config.js';

let sensors = [];
const sensorList = document.querySelector('#sensors-list');
const districtFilter = document.querySelector('#district-filter');
const criticalFilter = document.querySelector('#critical-filter');
const loadMessage = document.querySelector('#sensors-message');

// active/inactive — стан сенсора з API; normal/warning/critical — рівень шуму.
function getNoiseStatus(sensor) {
  if (sensor.noiseLevel <= NOISE_LIMITS.normalMax) return 'normal';
  if (sensor.noiseLevel <= NOISE_LIMITS.warningMax) return 'warning';
  return 'critical';
}

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
  const status = getNoiseStatus(sensor);
  const card = document.createElement('article');
  card.classList.add('sensor-card', `sensor-card--${status}`);
  const header = document.createElement('div');
  header.classList.add('sensor-card__header');
  const title = document.createElement('h3');
  title.classList.add('sensor-card__id');
  title.textContent = sensor.name;
  const badge = document.createElement('span');
  badge.classList.add('sensor-card__badge', `sensor-card__badge--${sensor.status}`);
  badge.textContent = sensor.status;
  header.append(title, badge);
  const district = document.createElement('p');
  district.classList.add('sensor-card__district');
  district.append(createIcon('pin'), `${sensor.district} район`);
  const location = document.createElement('p');
  location.classList.add('sensor-card__location');
  location.textContent = `ID: ${sensor.id}`;
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
    const matchesStatus = !criticalOnly || getNoiseStatus(sensor) === 'critical';
    return matchesDistrict && matchesStatus;
  });
  renderSensors(filteredSensors);
}

districtFilter.addEventListener('change', applyFilters);
criticalFilter.addEventListener('change', applyFilters);
loadSensors();


async function loadSensors() {
  districtFilter.disabled = true;
  criticalFilter.disabled = true;
  sensorList.setAttribute('aria-busy', 'true');
  sensorList.replaceChildren();
  loadMessage.textContent = 'Завантаження сенсорів…';

  try {
    if (!API_URL) {
      throw new Error('Вкажіть адресу ресурсу sensors у js/config.js.');
    }

    const response = await fetch(API_URL);
    console.log('GET sensors — HTTP-статус:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || !data.every(sensor =>
      sensor !== null && typeof sensor === 'object' &&
      typeof sensor.id === 'string' && sensor.id.trim() &&
      typeof sensor.name === 'string' && sensor.name.trim() &&
      typeof sensor.district === 'string' && sensor.district.trim() &&
      Number.isFinite(sensor.noiseLevel) &&
      ['active', 'inactive'].includes(sensor.status)
    )) {
      throw new Error('API повернув некоректний масив сенсорів. Перевірте поля та їх типи.');
    }

    sensors = data;
    console.log('Сенсори з API:', sensors);
    districtFilter.disabled = false;
    criticalFilter.disabled = false;
    loadMessage.textContent = sensors.length ? '' : 'У API поки немає сенсорів.';
    applyFilters();
  } catch (error) {
    sensors = [];
    console.error('Не вдалося завантажити сенсори:', error);
    loadMessage.textContent = API_URL
      ? 'Не вдалося завантажити дані. Перевірте підключення та адресу API.'
      : 'Потрібно вказати адресу MockAPI у файлі js/config.js.';
  } finally {
    sensorList.setAttribute('aria-busy', 'false');
  }
}
