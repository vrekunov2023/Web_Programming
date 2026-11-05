# Звіт з лабораторної роботи №4

**Тема:** «Робота з циклами, функціями та функціональними виразами в JavaScript. Консоль браузера»

**Виконав:** Рекунов Вадим

**Репозиторій:** <!-- встав посилання -->

---

## 1. Мета

Реалізувати алгоритм аналізу вимірювань шуму: навчитися добирати цикли відповідно до умови завершення, будувати функції з параметрами і `return`, розрізняти три форми запису функцій і передавати функцію як аргумент іншій функції.

## 2. Завдання

- Підключити зовнішній JS-файл до `index.html` через `<script defer>`.
- Реалізувати аналіз масиву `noiseLevels` на всіх чотирьох циклах: `for...of`, `for`, `while`, `do...while`.
- Декомпозувати алгоритм на окремі функції.
- Використати всі три форми функцій: Declaration, Expression, Arrow.
- Вивести підсумковий звіт у Console через `console.group`, `console.table`, `console.warn`, `console.error`.

## 3. Структура проєкту

```text
acoustic-watch/
├── index.html          ← підключає js/monitoring.js через <script defer>
├── css/main.css
├── scss/
├── images/
└── js/
    └── monitoring.js   ← вся логіка лабораторної
```

Підключення у `<head>`:

```html
<script src="./js/monitoring.js" defer></script>
```

`defer` завантажує файл паралельно з розбором HTML і запускає його після завершення розбору, тому до DOM можна звертатися одразу.

## 4. Вихідні дані

```js
const noiseLevels = [
  42, 55, 61, 78, 83, 67, 49, 72, 91, 58, 64, 76,
  53, 47, 88, 69, 74, 82, 95, 51, 71, -1, 85, 63,
  79, 39, 141, 86
];

const warningLevel  = 70;
const criticalLevel = 85;
const minValidLevel = 30;
const maxValidLevel = 130;
```

28 записів; два навмисно некоректні: `-1` (позиція 22) і `141` (позиція 27).

## 5. Хід роботи

### 5.1 Підключення і Console

Перед написанням основного алгоритму тимчасово додано три повідомлення для перевірки підключення:

```js
console.log('Скрипт моніторингу підключено');
console.warn('Дані є тестовими і не є нормативами шуму');
console.error('Демонстрація: помилку вимкнено перед фінальним звітом');
```

Після перевірки в DevTools → Console ці рядки закоментовано. У фінальній версії `console.error` використовується тільки для діагностики некоректних вхідних даних, а не як сигнал про збій програми.

### 5.2 Перевірка коректності — `isValidLevel`

Спільна умова, яка використовується у всіх циклах і функціях. Записана як **Function Declaration**, тому доступна до рядка свого оголошення (hoisting).

```js
function isValidLevel(level, min, max) {
  return Number.isFinite(level) && level >= min && level <= max;
}
```

### 5.3 Цикл `for...of` — підрахунок і категоризація

`for...of` дає саме значення без індексу — підходить для перегляду всіх елементів, коли позиція не потрібна. `continue` пропускає некоректні записи.

```js
for (const level of data) {
  if (!isValidLevel(level, minValid, maxValid)) continue;
  sum   += level;
  count++;
  if      (level <= warnLevel)  normal++;
  else if (level <= critLevel)  warning++;
  else                          critical++;
}
```

**Результат для основного масиву:** коректних 26, без перевищення 13, попередження 9, критичні 4.

### 5.4 Пошук мінімуму і максимуму

Початкове значення береться з першого коректного запису, а далі порівнюється в тому самому `for...of`. Якщо коректних значень немає — повертається `null`.

```js
if (min === null || level < min) min = level;
if (max === null || level > max) max = level;
```

**Результат:** мін. 39 dB, макс. 95 dB, середнє 68.38 dB.

### 5.5 Цикл `for` з `break` — перше критичне вимірювання

`for` зі збереженням індексу потрібен тут, бо треба знати позицію елемента. `break` зупиняє перегляд одразу після знахідки.

```js
function findFirstCritical(data, critLevel, minValid, maxValid) {
  for (let i = 0; i < data.length; i++) {
    if (!isValidLevel(data[i], minValid, maxValid)) continue;
    if (data[i] > critLevel) {
      return { value: data[i], position: i + 1 };
    }
  }
  return null;
}
```

**Прогноз перед запуском:** масив іде 42, 55, 61, 78, 83, 67, 49, 72, **91** — перше значення > 85 на індексі 8, тобто позиція 9.  
**Результат після запуску:** 91 dB, позиція 9 — прогноз підтвердився.

### 5.6 Цикл `while` — відновлення після критичного

Шукаємо три безпечні вимірювання поспіль після першого критичного. Якщо трапляється некоректне або вище `warningLevel` — лічильник скидається. На кожній ітерації `i++` гарантує, що цикл не стане нескінченним.

```js
function findRecovery(data, startIndex, warnLevel, minValid, maxValid) {
  let streak = 0;
  let i = startIndex;
  while (i < data.length) {
    const level = data[i];
    if (!isValidLevel(level, minValid, maxValid) || level > warnLevel) {
      streak = 0;
    } else {
      streak++;
      if (streak === 3) return i + 1;
    }
    i++;
  }
  return null;
}
```

**Результат:** після позиції 9 (91 dB) серія трьох безпечних вимірювань поспіль — не знайдено.

### 5.7 Цикл `do...while` — перше коректне значення

`do...while` виконує тіло хоча б один раз. Це доречно, коли масив не порожній і перший елемент треба перевірити в будь-якому випадку. Перед запуском окремо перевіряється, чи масив не порожній, щоб уникнути звернення до `data[0]` на пустому масиві.

```js
function findFirstValid(data, minValid, maxValid) {
  if (data.length === 0) return null;
  let i = 0;
  do {
    if (isValidLevel(data[i], minValid, maxValid)) return { value: data[i], position: i + 1 };
    i++;
  } while (i < data.length);
  return null;
}
```

**Результат:** перше коректне — 42 dB, позиція 1.

### 5.8 Три форми функцій

#### Function Declaration

Оголошення піднімається (hoisting): функцію можна викликати до рядка, де вона записана. Так реалізовано `findFirstCritical` і `isValidLevel`.

```js
// Виклик ДО оголошення — працює:
console.log(isValidLevel(50, 30, 130)); // true

function isValidLevel(level, min, max) {
  return Number.isFinite(level) && level >= min && level <= max;
}
```

#### Function Expression

Записується у змінну `const`. До рядка ініціалізації змінна перебуває в «мертвій зоні» (Temporal Dead Zone) і недоступна — виклик вище дає `ReferenceError`.

```js
// Виклик ДО ініціалізації — ReferenceError:
// countByCategory([], 70, 85, 30, 130); // ← перевірено в Console, потім прибрано

const countByCategory = function(data, warnLevel, critLevel, minValid, maxValid) {
  // ...
  return { normal, warning, critical };
};
```

`countByCategory` передається як callback у `calculateStatsWithCallback` **без дужок** — так передається сама функція, а не результат її виклику:

```js
function calculateStats(data, minValid, maxValid) {
  return calculateStatsWithCallback(data, minValid, maxValid, countByCategory);
}

function calculateStatsWithCallback(data, minValid, maxValid, categorize) {
  // ...
  const categories = categorize(data, warningLevel, criticalLevel, minValid, maxValid);
  return { count, average, min, max, categories };
}
```

#### Arrow Function

Компактний запис для коротких операцій. Один параметр — дужки можна опустити; кілька — обов'язкові.

```js
// Один параметр:
const statusLabel = value => `${value} dB`;

// Кілька параметрів:
const isAbove = (value, threshold) => value > threshold;
```

### 5.9 Тестування на окремих наборах

Тестові дані передаються у функції як аргументи — основний масив не змінюється.

| Набір | Результат |
| --- | --- |
| `[]` | коректних 0, avg/min/max = н/д, критичних не знайдено |
| `[-1, 141]` | коректних 0, обидва некоректні |
| `[70, 85, 86]` | 1 безпечне, 1 попередження, 1 критичне; перше критичне — 86 dB, поз. 3 |
| `[91, 50, 60, 80, 55, 65, 68]` | критичне на поз. 1; 80 перериває серію; відновлення на поз. 7 |

## 6. Підсумковий консольний звіт

Формується у `console.group` / `console.groupEnd`. Категорії виводить `console.table`, перевищення — `console.warn`, некоректні записи — `console.error`.

```
📊 Акустична варта — звіт моніторингу [noiseLevels]
  Пороги: попередження > 70 dB; критичний рівень > 85 dB
  Усього вимірювань:  28
  Коректних:          26
  Некоректних:        2
  ┌─────────────────────┬───────────┐
  │ Категорія           │ Кількість │
  ├─────────────────────┼───────────┤
  │ Без перевищення     │ 13        │
  │ Попередження        │ 9         │
  │ Критичні            │ 4         │
  └─────────────────────┴───────────┘
  Середній рівень:    68.38 dB
  Мінімальний рівень: 39 dB
  Максимальний рівень:95 dB
  ⚠️  Перше критичне вимірювання: 91 dB, позиція 9
  Відновлення: не знайдено
  ⚠️  Поріг 70 dB перевищено у 13 вимірюваннях.
  ❌ Некоректні дані: позиція 22 (-1 dB), позиція 27 (141 dB).
  📝 Висновок: зафіксовано 4 критичних вимірювань; після першого з них
     стійкого відновлення не виявлено.
```

## 7. Висновки

У роботі реалізовано повний алгоритм аналізу вимірювань шуму на JavaScript. `for...of` із `continue` підійшов для перегляду всіх значень без збереження позиції. `for` з `break` — для зупинки після першої знахідки. `while` — для пошуку серії з умовою скидання лічильника. `do...while` — для перевірки першого елемента непорожнього масиву гарантовано хоча б один раз.

Декомпозиція на функції зробила кожен крок незалежним і придатним для тестування на окремих наборах даних. Function Declaration підіймається до початку області видимості, тому її можна викликати раніше оголошення. Function Expression у `const` перебуває в TDZ до ініціалізації — виклик вище дає `ReferenceError`. Arrow Function зручна для коротких виразів. Передача `countByCategory` як callback без дужок показала, як функція може бути аргументом для іншої функції і викликатися нею синхронно.
