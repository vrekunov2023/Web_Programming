import express from 'express';
import sensors from './data/sensors.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Acoustic Watch API is running' });
});

app.get('/api/sensors', (req, res) => {
  res.json(sensors);
});

// Додатковий маршрут: лише активні датчики.
// Статичний шлях active оголошуємо раніше за динамічний :id.
app.get('/api/sensors/active', (req, res) => {
  const activeSensors = sensors.filter((sensor) => sensor.status === 'active');
  res.json(activeSensors);
});

// Додатковий маршрут: датчики вибраного району.
app.get('/api/sensors/district/:district', (req, res) => {
  const district = req.params.district.trim().toLocaleLowerCase('uk-UA');
  const districtSensors = sensors.filter((sensor) =>
    sensor.district.toLocaleLowerCase('uk-UA') === district
  );
  res.json(districtSensors);
});

app.get('/api/sensors/:id', (req, res) => {
  const sensorId = Number(req.params.id);
  const sensor = sensors.find((item) => item.id === sensorId);

  if (!sensor) {
    return res.status(404).json({ message: 'Sensor not found' });
  }

  res.json(sensor);
});

// Невідомі адреси API також повертають JSON.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// express.json() може відхилити некоректний JSON або завелике тіло запиту.
// Для неочікуваних серверних помилок повертаємо 500.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error(error);

  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500
    ? error.status
    : 500;
  const message = status === 500 ? 'Internal server error' : 'Invalid request';
  res.status(status).json({ message });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  const address = server.address();
  console.log(`Server is running on port ${address.port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the previous server or set another PORT.`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});

export { app, server };
