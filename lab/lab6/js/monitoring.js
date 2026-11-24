// ============================================================
//  Акустична варта — Лабораторна робота №4
//  Аналіз вимірювань шуму: цикли, функції, функціональні вирази
// ============================================================

const noiseLevels = [
  42, 55, 61, 78, 83, 67, 49, 72, 91, 58, 64, 76,
  53, 47, 88, 69, 74, 82, 95, 51, 71, -1, 85, 63,
  79, 39, 141, 86
];

const warningLevel  = 70;
const criticalLevel = 85;
const minValidLevel = 30;
const maxValidLevel = 130;


// ============================================================
//  6.3 / 6.4 — ФУНКЦІЇ
// ============================================================

// --- Function Declaration ---
// Можна викликати до оголошення (hoisting підіймає тіло функції).
function findFirstCritical(data, critLevel, minValid, maxValid) {
  for (let i = 0; i < data.length; i++) {
    if (!isValidLevel(data[i], minValid, maxValid)) continue;
    if (data[i] > critLevel) {
      return { value: data[i], position: i + 1 };
    }
  }
  return null;
}

// Перевірка hoisting: виклик ДО оголошення isValidLevel спрацює,
// бо нижче вона записана як Declaration.
// (Розкоментуйте у Console для перевірки: console.log(isValidLevel(50, 30, 130)))

function isValidLevel(level, min, max) {
  return Number.isFinite(level) && level >= min && level <= max;
}

// --- Function Expression (const) ---
// Недоступна до цього рядка — виклик вище спричинить ReferenceError.
const countByCategory = function(data, warnLevel, critLevel, minValid, maxValid) {
  let normal = 0, warning = 0, critical = 0;
  for (const level of data) {
    if (!isValidLevel(level, minValid, maxValid)) continue;
    if (level <= warnLevel)                           normal++;
    else if (level <= critLevel)                      warning++;
    else                                              critical++;
  }
  return { normal, warning, critical };
};

function calculateStats(data, minValid, maxValid) {
  // Приймає countByCategory як callback, щоб продемонструвати передачу функції як аргумент
  return calculateStatsWithCallback(data, minValid, maxValid, countByCategory);
}

function calculateStatsWithCallback(data, minValid, maxValid, categorize) {
  let sum = 0, count = 0, min = null, max = null;
  for (const level of data) {
    if (!isValidLevel(level, minValid, maxValid)) continue;
    sum += level;
    count++;
    if (min === null || level < min) min = level;
    if (max === null || level > max) max = level;
  }
  const average = count > 0 ? sum / count : null;
  const categories = categorize(data, warningLevel, criticalLevel, minValid, maxValid);
  return { count, average, min, max, categories };
}

function findRecovery(data, firstCriticalIndex, warnLevel, minValid, maxValid) {
  if (firstCriticalIndex === null) return null;
  let streak = 0;
  let i = firstCriticalIndex; // індекс масиву (0-based), стартуємо після критичного
  while (i < data.length) {
    const level = data[i];
    if (!isValidLevel(level, minValid, maxValid) || level > warnLevel) {
      streak = 0;
    } else {
      streak++;
      if (streak === 3) return i + 1; // позиція для людини
    }
    i++;
  }
  return null;
}

function findFirstValid(data, minValid, maxValid) {
  if (data.length === 0) return null;
  let i = 0;
  do {
    if (isValidLevel(data[i], minValid, maxValid)) return { value: data[i], position: i + 1 };
    i++;
  } while (i < data.length);
  return null;
}

// --- Arrow Functions ---
const statusLabel   = value => `${value} dB`;
const isAbove       = (value, threshold) => value > threshold;

function countInvalid(data, minValid, maxValid) {
  const invalids = [];
  for (let i = 0; i < data.length; i++) {
    if (!isValidLevel(data[i], minValid, maxValid)) {
      invalids.push({ position: i + 1, value: data[i] });
    }
  }
  return invalids;
}

function countExceedingWarning(data, warnLevel, minValid, maxValid) {
  let count = 0;
  for (const level of data) {
    if (isValidLevel(level, minValid, maxValid) && isAbove(level, warnLevel)) count++;
  }
  return count;
}


// ============================================================
//  6.1 — Демонстрація console.log / .warn / .error (потім прибрати)
// ============================================================
// console.log('Скрипт моніторингу підключено');
// console.warn('Дані є тестовими і не є нормативами шуму');
// console.error('Демонстрація: помилку вимкнено перед фінальним звітом');


// ============================================================
//  6.6 — ПІДСУМКОВИЙ КОНСОЛЬНИЙ ЗВІТ
// ============================================================

function runReport(data, label = 'noiseLevels') {
  const invalids = countInvalid(data, minValidLevel, maxValidLevel);
  const stats    = calculateStats(data, minValidLevel, maxValidLevel);
  const firstCritResult = findFirstCritical(data, criticalLevel, minValidLevel, maxValidLevel);
  const firstCritIndex  = firstCritResult ? firstCritResult.position : null; // 1-based
  const recoveryPos = findRecovery(
    data,
    firstCritIndex !== null ? firstCritIndex : null, // передаємо 1-based; перетворимо всередині
    warningLevel, minValidLevel, maxValidLevel
  );

  // findRecovery очікує 0-based індекс після критичного — переробимо виклик
  const firstCritIdx0 = firstCritResult ? firstCritResult.position /* 1-based */ - 1 + 1 : null;
  const recovery = findRecovery(data, firstCritIdx0, warningLevel, minValidLevel, maxValidLevel);

  const exeedCount = countExceedingWarning(data, warningLevel, minValidLevel, maxValidLevel);
  const avg = stats.average !== null ? stats.average.toFixed(2) : 'н/д';

  console.group(`📊 Акустична варта — звіт моніторингу [${label}]`);

  console.log(`Пороги: попередження > ${warningLevel} dB; критичний рівень > ${criticalLevel} dB`);
  console.log(`Усього вимірювань:  ${data.length}`);
  console.log(`Коректних:          ${stats.count}`);
  console.log(`Некоректних:        ${invalids.length}`);

  console.table([
    { 'Категорія': 'Без перевищення', 'Кількість': stats.categories.normal  },
    { 'Категорія': 'Попередження',    'Кількість': stats.categories.warning  },
    { 'Категорія': 'Критичні',        'Кількість': stats.categories.critical }
  ]);

  console.log(`Середній рівень:    ${avg} dB`);
  console.log(`Мінімальний рівень: ${stats.min ?? 'н/д'} dB`);
  console.log(`Максимальний рівень:${stats.max ?? 'н/д'} dB`);

  if (firstCritResult) {
    console.warn(`⚠️  Перше критичне вимірювання: ${statusLabel(firstCritResult.value)}, позиція ${firstCritResult.position}`);
  } else {
    console.log('Перше критичне вимірювання: не знайдено');
  }

  if (recovery !== null) {
    console.log(`✅ Відновлення — три безпечні вимірювання поспіль: позиція ${recovery}`);
  } else {
    console.log('Відновлення — три безпечні вимірювання поспіль: не знайдено');
  }

  if (isAbove(exeedCount, 0)) {
    console.warn(`⚠️  Поріг ${warningLevel} dB перевищено у ${exeedCount} вимірюваннях.`);
  }

  if (invalids.length > 0) {
    const list = invalids.map(e => `позиція ${e.position} (${e.value} dB)`).join(', ');
    console.error(`❌ Некоректні дані: ${list}.`);
  }

  const conclusionParts = [];
  if (stats.categories.critical > 0) {
    conclusionParts.push(`зафіксовано ${stats.categories.critical} критичних вимірювань`);
  }
  if (firstCritResult && recovery === null) {
    conclusionParts.push('після першого з них стійкого відновлення не виявлено');
  } else if (firstCritResult && recovery !== null) {
    conclusionParts.push(`відновлення зафіксовано на позиції ${recovery}`);
  }
  if (conclusionParts.length === 0) conclusionParts.push('критичних вимірювань не виявлено');
  console.log(`📝 Висновок: ${conclusionParts.join('; ')}.`);

  console.groupEnd();
}


// ============================================================
//  6.2.6 — Тестування на окремих наборах даних
// ============================================================

function runAllReports() {
  runReport(noiseLevels, 'noiseLevels (основний масив)');

  console.group('🧪 Тестові набори');
  runReport([], '[] — порожній масив');
  runReport([-1, 141], '[-1, 141] — лише некоректні');
  runReport([70, 85, 86], '[70, 85, 86] — один безпечний, одне попередження, одне критичне');

  // Серія з перериванням відновлення
  runReport(
    [91, 50, 60, 80, 55, 65, 68],
    'Перервана серія: критичне, потім два безпечних, потім перевищення, потім ще три'
  );
  console.groupEnd();

  // Перше коректне значення (do...while)
  console.group('🔍 do...while — перше коректне значення');
  console.log('noiseLevels:', findFirstValid(noiseLevels, minValidLevel, maxValidLevel));
  console.log('[]:', findFirstValid([], minValidLevel, maxValidLevel));
  console.log('[-1, 50]:', findFirstValid([-1, 50], minValidLevel, maxValidLevel));
  console.groupEnd();
}

runAllReports();
