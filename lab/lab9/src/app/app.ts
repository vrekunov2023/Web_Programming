import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sensor } from './sensor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  sensors: Sensor[] = [
    { id: 1, name: 'Сенсор Центр', district: 'Галицький', noiseLevel: 72, status: 'active' },
    { id: 2, name: 'Сенсор Сихів', district: 'Сихівський', noiseLevel: 58, status: 'active' },
    { id: 3, name: 'Сенсор Левандівка', district: 'Залізничний', noiseLevel: 45, status: 'inactive' }
  ];

  newName = '';
  newDistrict = '';
  newNoiseLevel: number | null = null;
  errorMessage = '';
  feedback = '';

  get activeCount(): number {
    return this.sensors.filter((sensor) => sensor.status === 'active').length;
  }

  addSensor(): void {
    const name = this.newName.trim();
    const district = this.newDistrict.trim();
    const noiseLevel = this.newNoiseLevel;

    if (!name || !district || noiseLevel === null ||
        !Number.isFinite(noiseLevel) || noiseLevel < 0) {
      this.errorMessage = 'Введіть назву, район і невід’ємне числове значення рівня шуму.';
      this.feedback = '';
      return;
    }

    const nextId = this.sensors.length
      ? Math.max(...this.sensors.map((sensor) => sensor.id)) + 1
      : 1;

    this.sensors.push({ id: nextId, name, district, noiseLevel, status: 'active' });
    this.newName = '';
    this.newDistrict = '';
    this.newNoiseLevel = null;
    this.errorMessage = '';
    this.feedback = `Датчик «${name}» додано.`;
  }

  deleteSensor(id: number): void {
    const sensor = this.sensors.find((item) => item.id === id);
    if (!sensor) return;
    this.sensors = this.sensors.filter((item) => item.id !== id);
    this.feedback = `Датчик «${sensor.name}» видалено.`;
  }

  toggleStatus(id: number): void {
    const sensor = this.sensors.find((item) => item.id === id);
    if (!sensor) return;
    sensor.status = sensor.status === 'active' ? 'inactive' : 'active';
    this.feedback = `Статус датчика «${sensor.name}»: ${sensor.status}.`;
  }
}
