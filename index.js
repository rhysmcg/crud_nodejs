const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const axios = require('axios'); // Add axios for HTTP requests
const FormData = require('form-data');
const app = express();

const API_KEY = "GxN-8q8EHmK3GDR-y2Z_55Y0JmcBfkUQXUOzZtD__o_gFaJTjd6Q8g";
const DB_OWNER = 'rhysmcg';
const DB_NAME = 'database.db';
const API_URL = 'https://api.dbhub.io/v1';

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming request bodies as JSON
app.use(bodyParser.json());

// Parse incoming request bodies as urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to use EJS templates
app.set('view engine', 'ejs');

// Helper function to execute SQL commands
async function executeSQL(sql, method = 'query') {
	try {
	    const form = new FormData();
	    form.append('apikey', API_KEY);
	    form.append('dbowner', DB_OWNER);
	    form.append('dbname', DB_NAME);
	    var sql_encoded = base64Encoded = Buffer.from(sql).toString('base64');
	    form.append('sql', sql_encoded); // Your SQL query here
	    const headers = form.getHeaders();
		const endpoint = `${API_URL}/${method}`;
		const response = await axios.post(endpoint, form, { headers });
		console.log(response.data)

		return response.data;
	} catch (error) {
		console.error('Database error:', error.response?.data || error.message);
		throw new Error('Database operation failed');
	}
}

// Home page
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html');
});

// List all records
app.get('/list', async (req, res) => {
	try {
		const data = await executeSQL('SELECT * FROM Staff');
		// Transform the result into an array of objects
		const transformedRecords = data.map(record => {
			let transformed = {};
			record.forEach(field => {
			transformed[field.Name] = field.Value;
		});
		return transformed;
		});

		res.render('list', { records: transformedRecords });
	} catch (err) {
		console.error(err);
		res.sendStatus(500);
	}
});

// Add new record page
app.get('/add', (req, res) => {
	res.render('add');
});

// Add new record action
app.post('/add', async (req, res) => {
	const { name, email, phone } = req.body;
	const sql = `INSERT INTO Staff (name, email, phone) VALUES ('${name}', '${email}', ${phone})`;
	try {
		await executeSQL(sql, 'execute');
		res.redirect('/list');
	} catch (err) {
		console.error(err);
		res.sendStatus(500);
	}
});

// Edit record page
app.get('/edit/:id', async (req, res) => {
	const id = req.params.id;
	const sql = `SELECT * FROM Staff WHERE id = ${id}`;
	try {
		const data = await executeSQL(sql);
		if (data.length === 0) return res.sendStatus(404);
		res.render('edit', { record: data[0] });
	} catch (err) {
		console.error(err);
		res.sendStatus(500);
	}
});

// Edit record action
app.post('/edit/:id', async (req, res) => {
	const id = req.params.id;
	const { name, email, phone } = req.body;
	const sql = `UPDATE Staff SET name = '${name}', email = '${email}', phone = ${phone} WHERE id = ${id}`;
	try {
		await executeSQL(sql, 'execute');
		res.redirect('/list');
	} catch (err) {
		console.error(err);
		res.sendStatus(500);
	}
});

// Delete record action
app.get('/delete/:id', async (req, res) => {
	const id = req.params.id;
	const sql = `DELETE FROM Staff WHERE id = ${id}`;
	try {
		await executeSQL(sql, 'execute');
		res.redirect('/list');
	} catch (err) {
		console.error(err);
		res.sendStatus(500);
	}
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});