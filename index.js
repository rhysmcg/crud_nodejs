// index.js

const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');

const app = express();

const db = new sqlite3.Database('database.db');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming request bodies as JSON
app.use(bodyParser.json());

// Parse incoming request bodies as urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to use EJS templates
app.set('view engine', 'ejs');

// Set up the database first, in case nothing is inside it
db.serialize(function () {
	// Create a table
	db.run("CREATE TABLE IF NOT EXISTS Staff (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, phone TEXT)")
});

// Home page
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

// List all records
app.get('/list', (req, res) => {
	db.all('SELECT * FROM Staff', (err, records) => {
		if (err) {
			console.error(err);
			return res.sendStatus(500);
		}
		res.render('list', { records });
	});
});

// Add new record page
app.get('/add', (req, res) => {
	res.render('add');
});

// Add new record action
app.post('/add', (req, res) => {
	const { name, email, phone } = req.body;
	db.run('INSERT INTO Staff (name, email, phone) VALUES (?, ?, ?)', [name, email, phone], (err) => {
		if (err) {
			console.error(err);
			return res.sendStatus(500);
		}
		res.redirect('/list');
	});
});

// Edit record page
app.get('/edit/:id', (req, res) => {
	const id = req.params.id;
	db.get('SELECT * FROM Staff WHERE id = ?', id, (err, record) => {
		if (err) {
			console.error(err);
			return res.sendStatus(500);
		}
		if (!record) {
			return res.sendStatus(404);
		}
		res.render('edit', { record });
	});
});

// Edit record action
app.post('/edit/:id', (req, res) => {
	const id = req.params.id;
	const { name, email, phone } = req.body;
	db.run('UPDATE Staff SET name = ?, email = ?, phone = ? WHERE id = ?', [name, email, phone, id], (err) => {
		if (err) {
			console.error(err);
			return res.sendStatus(500);
		}
		res.redirect('/list');
	});
});

// Delete record action
app.get('/delete/:id', (req, res) => {
	const id = req.params.id;
	db.run('DELETE FROM Staff WHERE id = ?', id, (err) => {
		if (err) {
			console.error(err);
			return res.sendStatus(500);
		}
		res.redirect('/list');
	});
});

const port = 3000;
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
