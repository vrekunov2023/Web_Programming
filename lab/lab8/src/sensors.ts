interface Sensor {
  id: string;
  name: string;
  district: string;
  noiseLevel: number;
  status: 'active' | 'inactive';
}

type NoiseStatus = 'normal' | 'warning' | 'critical';
type IconName = 'pin' | 'sound';

const API_URL: string = 'https://6b057043db01cf4636088933.mockapi.io/api/v1/sensors';
const NOISE_LIMITS = { normalMax: 55, warningMax: 70 };
let sensors: Sensor[] = [];

const containerElement = document.querySelector<HTMLDivElement>('#sensors');
const districtElement = document.querySelector<HTMLSelectElement>('#district-filter');
const criticalElement = document.querySelector<HTMLInputElement>('#critical-filter');
const messageElement = document.querySelector<HTMLParagraphElement>('#sensors-message');

if (!containerElement || !districtElement || !criticalElement || !messageElement) {
  throw new Error('Не знайдено контейнер сенсорів, фільтри або повідомлення.');
}

// Після перевірки зберігаємо посилання без типу null.
const sensorList: HTMLDivElement = containerElement;
const districtFilter: HTMLSelectElement = districtElement;
const criticalFilter: HTMLInputElement = criticalElement;
const loadMessage: HTMLParagraphElement = messageElement;

function getNoiseStatus(sensor: Sensor): NoiseStatus {
  if (sensor.noiseLevel <= NOISE_LIMITS.normalMax) return 'normal';
  if (sensor.noiseLevel <= NOISE_LIMITS.warningMax) return 'warning';
  return 'critical';
}

function createIcon(name: IconName): SVGSVGElement {
  const paths: Record<IconName, string[]> = {
    pin: ['M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z', 'M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
    sound: ['M3 10v4M7 6v12M12 2v20M17 6v12M21 10v4'],
  };
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('class', 'sensor-card__icon');
  icon.setAttribute('aria-hidden', 'true');
  paths[name].forEach((data: string): void => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', data);
    icon.append(path);
  });
  return icon;
}

function createSensorCard(sensor: Sensor): HTMLElement {
  const status: NoiseStatus = getNoiseStatus(sensor);
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

function renderSensors(sensorArray: Sensor[]): void {
  sensorList.replaceChildren();
  sensorArray.forEach((sensor: Sensor): void => {
    sensorList.append(createSensorCard(sensor));
  });
}

function applyFilters(): void {
  const selectedDistrict: string = districtFilter.value;
  const criticalOnly: boolean = criticalFilter.checked;
  const filteredSensors: Sensor[] = sensors.filter((sensor: Sensor): boolean => {
    const matchesDistrict = selectedDistrict === 'all' || sensor.district === selectedDistrict;
    const matchesNoise = !criticalOnly || getNoiseStatus(sensor) === 'critical';
    return matchesDistrict && matchesNoise;
  });
  renderSensors(filteredSensors);
}

// Interface перевіряється компілятором; дані сервера перевіряємо також під час виконання.
function isSensor(value: unknown): value is Sensor {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string' && item.id.trim().length > 0 &&
    typeof item.name === 'string' && item.name.trim().length > 0 &&
    typeof item.district === 'string' && item.district.trim().length > 0 &&
    typeof item.noiseLevel === 'number' && Number.isFinite(item.noiseLevel) &&
    (item.status === 'active' || item.status === 'inactive');
}

async function loadSensors(): Promise<void> {
  districtFilter.disabled = true;
  criticalFilter.disabled = true;
  sensorList.setAttribute('aria-busy', 'true');
  sensorList.replaceChildren();
  loadMessage.textContent = 'Завантаження сенсорів…';

  try {
    const response: Response = await fetch(API_URL);
    console.log('GET sensors — HTTP-статус:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data) || !data.every(isSensor)) {
      throw new Error('API повернув некоректний масив сенсорів.');
    }

    const loadedSensors: Sensor[] = data;
    sensors = loadedSensors;
    console.log('Сенсори з API:', sensors);
    districtFilter.disabled = false;
    criticalFilter.disabled = false;
    loadMessage.textContent = sensors.length ? '' : 'У API поки немає сенсорів.';
    applyFilters();
  } catch (error: unknown) {
    sensors = [];
    console.error('Не вдалося завантажити сенсори:', error);
    loadMessage.textContent = 'Не вдалося завантажити дані. Перевірте підключення та адресу API.';
  } finally {
    sensorList.setAttribute('aria-busy', 'false');
  }
}

districtFilter.addEventListener('change', applyFilters);
criticalFilter.addEventListener('change', applyFilters);
loadSensors();

// Залишаємо файл модулем, щоб його змінні не потрапляли у глобальний простір.
export {};
