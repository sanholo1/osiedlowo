import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend działa!',
    timestamp: new Date().toISOString(),
  });
});

// Test bazy danych
app.get('/test-db', async (req, res) => {
  try {
    // Konfiguracja połączenia z bazą
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3307'),
      user: process.env.DB_USERNAME || 'osiedlowo_user',
      password: process.env.DB_PASSWORD || 'osiedlowo_password',
      database: process.env.DB_DATABASE || 'osiedlowo_db'
    });

    // Test połączenia
    const [rows] = await connection.execute('SELECT 1 as test');
    await connection.end();

    res.json({
      status: 'OK',
      message: 'Połączenie z bazą danych działa!',
      data: rows
    });
  } catch (error) {
    console.error('Błąd bazy danych:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Błąd połączenia z bazą',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoint do tworzenia tabeli użytkowników
app.post('/create-users-table', async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3307'),
      user: process.env.DB_USERNAME || 'osiedlowo_user',
      password: process.env.DB_PASSWORD || 'osiedlowo_password',
      database: process.env.DB_DATABASE || 'osiedlowo_db'
    });

    // Tworzenie tabeli users
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await connection.execute(createTableSQL);
    await connection.end();

    res.json({
      status: 'OK',
      message: 'Tabela users została utworzona!'
    });
  } catch (error) {
    console.error('Błąd tworzenia tabeli:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Błąd tworzenia tabeli',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoint rejestracji
app.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Podstawowa walidacja
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Wszystkie pola są wymagane'
      });
    }

    // Połączenie z bazą
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3307'),
      user: process.env.DB_USERNAME || 'osiedlowo_user',
      password: process.env.DB_PASSWORD || 'osiedlowo_password',
      database: process.env.DB_DATABASE || 'osiedlowo_db'
    });

    // Sprawdź czy użytkownik już istnieje
    const [existingUsers] = await connection.execute(
      'SELECT email FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      await connection.end();
      return res.status(400).json({
        status: 'ERROR',
        message: 'Użytkownik z tym emailem już istnieje'
      });
    }

    // Hashowanie hasła
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Dodawanie użytkownika
    await connection.execute(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, passwordHash, firstName, lastName]
    );

    await connection.end();

    res.status(201).json({
      status: 'OK',
      message: 'Użytkownik został zarejestrowany!'
    });

  } catch (error) {
    console.error('Błąd rejestracji:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Błąd rejestracji',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoint logowania
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Walidacja
    if (!email || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Email i hasło są wymagane'
      });
    }

    // Połączenie z bazą
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3307'),
      user: process.env.DB_USERNAME || 'osiedlowo_user',
      password: process.env.DB_PASSWORD || 'osiedlowo_password',
      database: process.env.DB_DATABASE || 'osiedlowo_db'
    });

    // Znajdź użytkownika
    const [users] = await connection.execute(
      'SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = ?',
      [email]
    );

    await connection.end();

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Nieprawidłowy email lub hasło'
      });
    }

    const user = users[0] as any;

    // Sprawdź hasło
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Nieprawidłowy email lub hasło'
      });
    }

    // Generuj JWT token
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const token = (jwt as any).sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      status: 'OK',
      message: 'Logowanie zakończone sukcesem',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });

  } catch (error) {
    console.error('Błąd logowania:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Błąd logowania',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend działa na porcie ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app;