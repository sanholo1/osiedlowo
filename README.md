Osiedlowo - Instrukcja uruchomienia aplikacji

Wymagania wstepne:
1. Node.js (wersja 18 lub wyzsza)
2. Docker i Docker Compose
3. Git

Kroki instalacji:

1. Sklonuj repozytorium:
git clone https://github.com/sanholo1/osiedlowo.git
cd osiedlowo

2. Uruchom baze danych:
docker-compose up -d database

3. Konfiguracja backendu:
cd backend
npm install
cp .env.example .env
npm run build
npm run dev

4. Konfiguracja frontendu (w nowym oknie terminala):
cd frontend
npm install
cp .env.example .env
npm start

5. Inicjalizacja bazy danych (w nowym oknie terminala):
cd backend
npm run schema:sync

Adresy URL:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Baza danych MySQL: localhost:3306

Dane dostepu do bazy danych:
- Uzytkownik: osiedlowo_user
- Haslo: osiedlowo_password
- Nazwa bazy: osiedlowo_db

Rozwiazywanie problemow:

1. Jesli baza danych nie dziala:
- Sprawdz czy Docker jest uruchomiony
- Zatrzymaj kontenery: docker-compose down
- Uruchom ponownie: docker-compose up -d database

2. Jesli backend nie uruchamia sie:
- Sprawdz czy baza danych dziala
- Sprawdz plik .env
- Wyczysc cache: rm -rf dist node_modules
- Zainstaluj ponownie: npm install

3. Jesli frontend nie uruchamia sie:
- Sprawdz czy backend dziala
- Sprawdz plik .env
- Wyczysc cache: rm -rf build node_modules
- Zainstaluj ponownie: npm install

Zatrzymywanie aplikacji:
1. Zatrzymaj frontend: Ctrl+C w oknie frontendu
2. Zatrzymaj backend: Ctrl+C w oknie backendu
3. Zatrzymaj baze: docker-compose down
