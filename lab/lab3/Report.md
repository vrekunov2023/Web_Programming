# Звіт з лабораторної роботи №3

**Тема:** «Адаптивна верстка вебсторінки за допомогою Flexbox, CSS Grid та препроцесора SCSS»
---

## 1. Мета

Перетворити сторінку «Акустична варта» з попередньої роботи на адаптивний інтерфейс: перенести стилі в SCSS, розбити їх на модулі та реалізувати перебудову макета для mobile, tablet і desktop через Flexbox, CSS Grid і Media Queries.

## 2. Схема проєкту

```text
acoustic-watch/
├── index.html              # семантична розмітка (BEM-класи), meta viewport
├── assets/
│   └── images/
│       └── hero-bg.png     # зображення для hero
├── scss/                   # вихідні стилі
│   ├── main.scss           # точка входу: @use усіх модулів
│   ├── _variables.scss     # кольори, відступи, радіуси, контейнер, breakpoints
│   ├── _mixins.scss        # respond-to, flex-center, flex-column, container, responsive-grid
│   ├── _base.scss          # box-sizing, body, img, form controls, h2
│   ├── _layout.scss        # container, header, hero, сітки, footer
│   └── _components.scss    # nav, кнопка, картки, warning, таблиця, форма
├── css/
│   └── main.css            # результат компіляції scss/main.scss
├── package.json            # скрипти: npm run build / npm run sass
└── report/
    ├── report.md
    └── img/
```

**Потік збірки:** `scss/main.scss` → (`@use` модулів) → `sass` → `css/main.css` → підключається в `index.html`.

### Призначення модулів

| Файл | Відповідальність |
| --- | --- |
| `_variables.scss` | Змінні `$color-*`, `$space-*`, `$radius`, `$container-max`, `$bp-tablet` (768px), `$bp-desktop` (1024px) |
| `_mixins.scss` | `respond-to($bp)` для Mobile First, `flex-center`, `flex-column`, `container`, `responsive-grid` |
| `_base.scss` | Базові стилі та захист від переповнення (`img { max-width: 100% }`) |
| `_layout.scss` | Каркас сторінки: header, hero, сітки карток, footer |
| `_components.scss` | Окремі компоненти: навігація, картки, кнопка, банер, таблиця, форма |
| `main.scss` | Підключення всіх модулів через `@use` (без `@import`) |

### Ключовий mixin

```scss
@mixin respond-to($breakpoint) {
  @media (min-width: $breakpoint) {
    @content;
  }
}
```

## 3. Схема адаптивності

Підхід **Mobile First**: базові стилі для mobile (< 768 px), далі `min-width` додає колонки на tablet (≥ 768 px) та desktop (≥ 1024 px).

| Блок | Технологія | Mobile | Tablet | Desktop |
| --- | --- | --- | --- | --- |
| Header | Flexbox | колонка | рядок, `space-between` | рядок |
| Nav | Flexbox | колонка | рядок + `wrap` | рядок |
| Hero | Grid | 1 колонка (текст, потім фото) | `1.1fr 0.9fr` | `1.1fr 0.9fr` |
| Поточний моніторинг | Grid | 1 колонка | 2 колонки | 5 колонок |
| Напрями роботи | Grid | 1 колонка | 2 колонки | 4 колонки |
| Картка (всередині) | Flexbox | вертикальна колонка | те саме | те саме |
| Таблиця | `overflow-x: auto` | скрол усередині блока | без скролу | без скролу |
| Форма | Grid | 1 колонка | поля у 2 колонки, опис на всю ширину | `2fr 1fr` |
| Footer | Flexbox | колонка | рядок, `space-between` | рядок |

## 4. Компіляція

Використано npm + Sass:

```bash
npm install
npm run build    # scss/main.scss -> css/main.css
npm run sass     # режим watch
```

## 5. Результат
Посилання на сторінку:
https://vrekunov2023.github.io/Web_Programming/lab/lab3/index.html

Перевірка на різних ширинах viewport (DevTools / емуляція):

| Viewport | Моніторинг | Напрями | Форма | Горизонтальний скрол |
| --- | :---: | :---: | :---: | :---: |
| 375 px | 1 | 1 | 1 | немає |
| 768 px | 2 | 2 | 1 | немає |
| 1024 px | 5 | 4 | 2 | немає |
| 1280 px | 5 | 4 | 2 | немає |

**Mobile (375 px)**

<img width="1246" height="760" alt="image" src="https://github.com/user-attachments/assets/317ca610-2c11-4f3d-9e27-084301d819bb" />


**Desktop (1280 px)**

<img width="1264" height="742" alt="image" src="https://github.com/user-attachments/assets/21385723-0aaf-4b1b-8a86-f372228fc41c" />


## 6. Висновки

Сторінку «Акустична варта» перебудовано на адаптивну за підходом Mobile First. Flexbox використано для одновимірних компонентів (header, навігація, footer, вміст карток), CSS Grid — для двовимірних сіток (hero, картки, форма). SCSS-змінні й mixins прибрали дублювання коду, а модульна структура на `@use` зробила проєкт зрозумілим. CSS отримано компіляцією SCSS, а на всіх перевірених ширинах горизонтального переповнення сторінки немає.
