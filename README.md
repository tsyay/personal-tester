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

#### Установка Node.js и npm

1. Установите Node.js и npm:
- Windows: Скачайте и установите с [официального сайта](https://nodejs.org/)
- macOS: Используйте Homebrew:
```bash
brew install node
```
- Linux (Ubuntu/Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Проверьте установку:
```bash
node --version
npm --version
```

#### Установка инструментов разработки

1. Установите глобальные инструменты:
```bash
npm install -g create-react-app
npm install -g typescript
npm install -g @types/node
npm install -g prettier
npm install -g eslint
```

2. Откройте новый терминал и перейдите в папку frontend:
```bash
cd frontend
```

3. Установите зависимости проекта:
```bash
npm install
```

4. Запустите сервер разработки:
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