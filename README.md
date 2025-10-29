# Osiedlowo

## Wymagania systemowe
1. Node.js (v18.x lub wyższa)
2. Docker Desktop (najnowsza wersja)
3. Docker Compose (najnowsza wersja)
4. Git

## Instalacja i uruchomienie

### 1. Przygotowanie projektu
```bash
# Klonowanie repozytorium
git clone https://github.com/sanholo1/osiedlowo.git
cd osiedlowo

# Uruchomienie bazy danych MySQL
docker compose up -d mysql

# Sprawdzenie czy MySQL jest uruchomiona
docker compose ps mysql
# lub
docker compose logs mysql

### 2. Konfiguracja backendu
```bash
cd backend
npm install
cp .env.example .env
npm run build
npm run schema:sync  # Inicjalizacja bazy danych
npm run dev
```

### 3. Konfiguracja frontendu
```bash
# W nowym oknie terminala
cd frontend
npm install
cp .env.example .env
npm start
```

## Adresy URL aplikacji
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Baza danych MySQL: localhost:3306

## Konfiguracja bazy danych MySQL
- Host: localhost
- Port: 3307 (zmapowany z 3306 kontenera)
- Użytkownik: osiedlowo_user
- Hasło: osiedlowo_password
- Nazwa bazy: osiedlowo_db
- Root hasło: root_password (dla celów administracyjnych)

### Połączenie z bazą danych
```bash
# Połączenie przez terminal
docker compose exec database mysql -u osiedlowo_user -posiedlowo_password osiedlowo_db

# Lub użyj klienta MySQL z następującymi danymi:
# Host: localhost
# Port: 3306
# User: osiedlowo_user
# Password: osiedlowo_password
# Database: osiedlowo_db
```

### Status bazy danych
```bash
# Sprawdzenie statusu kontenera MySQL
docker compose ps database

# Sprawdzenie logów MySQL
docker compose logs database

# Restart bazy danych (w razie problemów)
docker compose restart database
```

## Struktura projektu
```
frontend/  - Aplikacja React (TypeScript)
backend/   - API Node.js (Express + TypeScript)
```

## Rozwiązywanie problemów

### Problem z bazą danych
1. Sprawdź status Dockera: `docker ps`
2. Zrestartuj kontenery:
```bash
docker compose down
docker compose up -d
```

### Problem z backendem
1. Sprawdź logi: `docker compose logs backend`
2. Sprawdź połączenie z bazą danych
3. Zresetuj środowisko:
```bash
cd backend
rm -rf dist node_modules
npm install
npm run build
```

### Problem z frontendem
1. Sprawdź czy backend jest aktywny
2. Sprawdź konfigurację w `.env`
3. Zresetuj środowisko:
```bash
cd frontend
rm -rf build node_modules
npm install
```

## Zatrzymywanie środowiska
```bash
# Zatrzymanie wszystkich usług
docker compose down

# Lub zatrzymanie poszczególnych procesów
Ctrl+C - dla procesów npm (frontend/backend)
```
