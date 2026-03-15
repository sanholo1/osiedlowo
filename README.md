### Sem. 5 IO Projekt
W trakcie prac / Nieskończony
Dokumentacja: [sasiedzka_pomoc_final.pdf](sasiedzka_pomoc_final.pdf).

### 1️⃣ Sklonuj projekt
```bash
git clone https://github.com/sanholo1/osiedlowo.git
cd osiedlowo
```

### 2️⃣ Uruchom wszystko w Dockerze
```bash
docker compose up -d
```

### 3️⃣ Otwórz przeglądarkę
- **Frontend**: http://localhost:3000
- **Klient Czatu (Test)**: http://localhost:3001/chat-test.html

## Zatrzymanie aplikacji
```bash
docker compose down
```

### Port zajęty (3000, 3001 lub 3307)?
```bash
# Znajdź co zajmuje port
lsof -i :3001

# Zabij proces
kill -9 $(lsof -t -i:3001)
```

### Docker nie działa?
```bash
# Restart Dockera
docker compose down
docker compose up -d

# Zobacz logi
docker compose logs -f
```

### Baza danych nie tworzy tabel?
```bash
# Usuń wszystko i zacznij od nowa
docker compose down -v
docker compose up -d

# Sprawdź logi
docker compose logs -f backend
```

