const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.')));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'UserForms'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

// Helper para hashear contraseñas (MD5 es vulnerable)
function hashPassword(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}

// Ruta de configuración para inicializar la BD
app.get('/setup', (req, res) => {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS Users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user VARCHAR(50),
            password VARCHAR(255)
        )
    `;

    const createItemsTable = `
        CREATE TABLE IF NOT EXISTS items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT
        )
    `;

    connection.query(createUsersTable, (err) => {
        if (err) return res.status(500).send(err);
        
        connection.query(createItemsTable, (err) => {
            if (err) return res.status(500).send(err);

            // Insertar usuarios de prueba si no existen
            const checkUsers = 'SELECT * FROM Users WHERE user = "Tiago"';
            connection.query(checkUsers, (err, results) => {
                if (results.length === 0) {
                    const adminPass = hashPassword('admin123');
                    const shirohPass = hashPassword('nosexde');
                    
                    // Insertar Shiroh si falta
                    const insert = `INSERT INTO Users (user, password) VALUES ('Shiroh', '${shirohPass}')`;
                    connection.query(insert);
                    
                    // Intentar insertar admin si falta
                    const insertAdmin = `INSERT IGNORE INTO Users (user, password) VALUES ('admin', '${adminPass}')`;
                    connection.query(insertAdmin);
                }
            });

            // Insertar items de prueba si no existen
            const checkItems = 'SELECT * FROM items';
            connection.query(checkItems, (err, results) => {
                if (results.length === 0) {
                    const insertItems = `
                        INSERT INTO items (name, description) VALUES 
                        ('Item 1', 'Descripcion 1'),
                        ('Item 2', 'Descripcion 2'),
                        ('Secret Item', 'Este es un item secreto')
                    `;
                    connection.query(insertItems);
                }
            });

            res.send('Database setup complete.');
        });
    });
});

// Login Vulnerable
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Vulnerabilidad SQL Injection: concatenación directa
    
    const hashedPassword = hashPassword(password);
    
    // VULNERABILIDAD: Inserción directa del usuario sin sanitizar
    // Usando la columna 'user' según el nuevo esquema
    const query = `SELECT * FROM Users WHERE user = '${username}' AND password = '${hashedPassword}'`;
    
    console.log("Executing query:", query);

    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            // VULNERABILIDAD: Retorno de error detallado para pruebas SQLi
            return res.status(500).json({ error: err.sqlMessage || err.toString() });
        }

        if (results.length > 0) {
            const userObj = results[0];

            if (!userObj.role) userObj.role = 'user'; 
            
            res.json({ success: true, user: userObj });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Endpoint de Búsqueda Vulnerable
app.get('/search', (req, res) => {
    const queryParam = req.query.q;
    // VULNERABILIDAD: SQL Injection en búsqueda
    const query = `SELECT * FROM Users WHERE user LIKE '%${queryParam}%'`;
    
    console.log("Executing search query:", query);

    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            // VULNERABILIDAD: Retorno de error de BD al cliente
            return res.status(500).json({ error: err.sqlMessage || err.toString() });
        }
        res.json(results);
    });
});

// Endpoint de Items Vulnerable
app.get('/items', (req, res) => {
    const query = 'SELECT * FROM items';
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
