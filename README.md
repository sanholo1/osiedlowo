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
