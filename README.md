# Personal Tester

Образовательная платформа для создания и прохождения тестов, изучения курсов и статей.

## Требования

- Python 3.8 или выше
- Node.js 18 или выше
- npm 9 или выше

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-username/personal-tester.git
cd personal-tester
```

### 2. Настройка бэкенда

1. Создайте виртуальное окружение Python:
```bash
python -m venv venv
```

2. Активируйте виртуальное окружение:
- Windows:
```bash
venv\Scripts\activate
```
- macOS/Linux:
```bash
source venv/bin/activate
```

3. Установите зависимости Python:
```bash
pip install -r backend/requirements.txt
```

4. Создайте файл .env в папке backend:
```bash
cd backend
touch .env
```

5. Добавьте следующие переменные в .env:
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
```

6. Примените миграции:
```bash
python manage.py migrate
```

7. Создайте суперпользователя:
```bash
python manage.py createsuperuser
```

8. Запустите сервер разработки:
```bash
python manage.py runserver
```

### 3. Настройка фронтенда

1. Откройте новый терминал и перейдите в папку frontend:
```bash
cd frontend
```

2. Установите зависимости Node.js:
```bash
npm install
```

3. Запустите сервер разработки:
```bash
npm start
```

## Доступ к приложению

- Бэкенд API: http://localhost:8000
- Фронтенд: http://localhost:3000
- Админ-панель: http://localhost:8000/admin

## Структура проекта

```
personal-tester/
├── backend/              # Django бэкенд
│   ├── api/             # API endpoints
│   ├── core/            # Основные настройки
│   └── requirements.txt # Зависимости Python
├── frontend/            # React фронтенд
│   ├── public/         # Статические файлы
│   ├── src/           # Исходный код
│   └── package.json   # Зависимости Node.js
└── README.md          # Документация
```

## Основные функции

- Создание и прохождение тестов
- Управление курсами и статьями
- Система авторизации и ролей
- Отслеживание прогресса обучения

## Роли пользователей

- **ADMIN**: Полный доступ ко всем функциям
- **TEACHER**: Создание и управление контентом
- **STUDENT**: Прохождение тестов и изучение материалов

## Разработка

### Бэкенд

- Django 4.2
- Django REST Framework
- SQLite (для разработки)

### Фронтенд

- React 18
- React Router
- Axios
- Tailwind CSS

## Лицензия

MIT 