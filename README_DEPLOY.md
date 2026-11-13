# Руководство по развертыванию сайта ООО «Фаттория Плюс» через Docker

Это подробная пошаговая инструкция по установке и запуску веб-сайта и платформы риэлтерских услуг на вашем VPS/VDS сервере (Ubuntu / Debian / CentOS) с использованием **Docker** и **Docker Compose**, а также настройке домена и SSL-сертификата (HTTPS).

---

## 1. Архитектура и стек технологий сайта

### Клиентская часть (Frontend SPA)
- **React 19 + TypeScript**: Модульная компонентная архитектура с полной типизацией.
- **Vite 6**: Сборка, оптимизация ассетов, мгновенная компиляция.
- **Tailwind CSS v4**: Адаптивный современный дизайн для мобильных устройств, планшетов и десктопов.
- **Lucide React**: Векторные иконки.
- **html2pdf.js & jsPDF + safeHtml2Canvas**: Генерация официальных юридических договоров и актов в PDF точно по формату А4 (Постановление Совмина РБ №754/157).
- **Recharts & D3**: Интерактивные графики цен на недвижимость, аналитика рынка Минска.
- **Motion**: Анимации интерфейса.

### Серверная часть (Backend API)
- **Node.js (Express 5)**: Встроенный сервер API и статики в `server.ts`.
- **API НБРБ (`/api/nbrb-rate`)**: Автоматическое получение актуального официального курса доллара Нацбанка РБ для расчета цен в BYN и базовых величинах.
- **Синхронизация с Realt.by (`/api/realt-properties`)**: Парсер и кэширование актуальных объектов недвижимости.
- **Лидогенерация (`/api/submit-lead`)**: Прием заявок, оценка стоимости, запросы на консультации.
- **ИИ-консультант (`/api/ai-chat`)**: Интеграция с Google Gemini API для помощи клиентам и риэлтерам.
- **SEO-оптимизация (`/robots.txt`, `/sitemap.xml`)**: Автоматическая индексация поисковыми системами Яндекс и Google.

---

## 2. Пошаговая установка на сервер (Ubuntu / Debian)

### Шаг 1. Подключение к серверу по SSH
```bash
ssh root@IP_ВАШЕГО_СЕРВЕРА
```

### Шаг 2. Обновление пакетов и установка Docker
Выполните стандартную установку Docker и Docker Compose:
```bash
# Обновление списков пакетов
sudo apt update && sudo apt upgrade -y

# Установка необходимых утилит
sudo apt install -y curl git wget ca-certificates gnupg lsb-release

# Добавление официального репозитория Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker Engine и Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Проверка установки
docker --version
docker compose version
```

---

### Шаг 3. Загрузка проекта на сервер
Вы можете скопировать файлы проекта через `git clone` или `scp / rsync`:
```bash
# Перейдите в рабочую директорию
cd /var/www

# Склонируйте репозиторий (или распакуйте архив проекта)
git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ> fattoria-plus
cd fattoria-plus
```

---

### Шаг 4. Настройка переменных окружения (при необходимости)
Создайте файл `.env`:
```bash
nano .env
```
Вставьте необходимые ключи (например, ключ Gemini API):
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=ваш_ключ_если_используется_AI
```
*(Для сохранения нажмите `Ctrl+O`, `Enter`, затем `Ctrl+X`)*.

---

### Шаг 5. Сборка и запуск контейнера
Запустите сборку и запуск приложения в фоновом режиме:
```bash
docker compose up -d --build
```

Проверьте статус контейнера:
```bash
docker compose ps
docker compose logs -f
```
Приложение автоматически соберет продакшн-бандл и запустится на порту **3000**. Вы уже сможете открыть его по адресу: `http://IP_ВАШЕГО_СЕРВЕРА:3000`

---

## 3. Настройка домена и SSL-сертификата (HTTPS через Nginx на хосте)

Чтобы сайт открывался по домену (например, `fplus.by` или `fattoriaplus.by`) с защищенным замком HTTPS:

### 1. Установите Nginx и Certbot:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Создайте конфигурацию Nginx:
```bash
sudo nano /etc/nginx/sites-available/fattoria
```
Вставьте следующую конфигурацию (замените `ваш-домен.by` на ваш реальный домен):
```nginx
server {
    listen 80;
    server_name ваш-домен.by www.ваш-домен.by;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Активируйте сайт и перезапустите Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/fattoria /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Получите бесплатный SSL-сертификат Let's Encrypt:
```bash
sudo certbot --nginx -d ваш-домен.by -d www.ваш-домен.by
```
Certbot автоматически настроит перенаправление с HTTP на защищенный HTTPS и настроит автопродление сертификата.

---

## 4. Полезные команды управления контейнером

- **Остановить сайт**: `docker compose down`
- **Перезапустить сайт**: `docker compose restart`
- **Посмотреть логи в реальном времени**: `docker compose logs -f`
- **Обновить сайт после внесения изменений в код**:
  ```bash
  git pull
  docker compose up -d --build
  ```
