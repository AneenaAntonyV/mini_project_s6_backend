const express = require('express');
const mysql = require('mysql')
const cors = require('cors')
//const path = require('path');
const app=express()
// Middleware to parse URL-encoded data with extended support
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors())

// const connection=mysql.createConnection({
//     host:"localhost",
//     user:'root',
//     password:'',
//     database:'emergencyaiddb'
// })
const db_config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'emergencyaiddb'
};

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config);

  connection.connect(function(err) {
    if (err) {
      console.log('Error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    }
  });

  connection.on('error', function(err) {
    console.log('DB error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();


app.get('/',(re,res)=> {
    return res.json("From Backend side");
})

//app.use(express.static(path.join(__dirname, 'public')));
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

/*app.listen(5001,()=>{
    console.log("listening");
})*/

app.get("/categories",(req,res)=> {
    const query = 'SELECT * FROM categories';
    // executes the SQL query using the connection.query method provided by the MySQL package. 
    // It takes two arguments: the query string (query) and a callback function to handle the results.
    connection.query(query, (err, results) => {
        if (err) throw err;
        else {
            console.log('Category List:', results);
            console.log('Data fetched:', results);
            res.json(results);
        }
    });
})


app.get("/emergency_list", (req, res) => {
    const id = req.query.id; // Extract ID from query parameter

    if (!id) {
        return res.status(400).json({ error: 'ID parameter is required' });
    }

    const query = `SELECT * FROM emergency_list WHERE id = ?`;
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        console.log('Data fetched:', results);
        res.json(results);
    });
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM admins WHERE username = ? AND password = ?';

  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error fetching admin:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = results[0];
    res.json({ message: 'Login successful', admin: results[0] });
  });
});

app.post('/register', (req, res) => {
  const { name, email, phone, program } = req.body;
  const query = 'INSERT INTO registrations (name, email, phone, program) VALUES (?, ?, ?, ?)';
  connection.query(query, [name, email, phone, program], (err, result) => {
    if (err) {
      console.error('Error registering:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log('Registration successful');
    res.json({ message: 'Registration successful' });
  });
});

// Route to fetch registrations data
app.get('/registrations', (req, res) => {
  const query = 'SELECT * FROM registrations'; // SQL query to fetch all data

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching registrations:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results); // Send the fetched data as JSON response
  });
});

// Add a new route to fetch awareness programs data

app.post('/insertProgram', (req, res) => {
  const { heading, location, time, content } = req.body;

  const insertQuery = 'INSERT INTO awareness_programs (heading, location, time, content) VALUES (?, ?, ?, ?)';
  const values = [heading, location, time, content];

  connection.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error('Error inserting program data:', err);
      return res.status(500).json({ success: false, message: 'Error inserting program data' });
    }

    console.log('Program data inserted successfully');
    res.status(200).json({ success: true, message: 'Program data inserted successfully' });
  });
});
app.get('/api/awareness_programs', (req, res) => {
  const query = 'SELECT * FROM awareness_programs'; // SQL query to fetch all data from awareness_programs table

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching awareness programs:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results); // Send the fetched data as JSON response
  });
});


app.delete('/deleteProgram/:id', (req, res) => {
  const programId = req.params.id; // Extract the program ID from the request parameters

  // MySQL DELETE query to delete the program by ID
  const deleteQuery = 'DELETE FROM awareness_programs WHERE id = ?';
  connection.query(deleteQuery, [programId], (err, result) => {
    if (err) {
      console.error('Error deleting program:', err);
      return res.status(500).json({ success: false, message: 'Error deleting program' });
    }

    console.log('Program deleted successfully');
    return res.status(200).json({ success: true, message: 'Program deleted successfully' });
  });
});
// app.get('api/awareness_programs', (req, res) => {
//   const query = 'SELECT * FROM awareness_programs'; // SQL query to fetch all data from awareness_programs table

//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error('Error fetching awareness programs:', err);
//       return res.status(500).json({ error: 'Internal server error' });
//     }

//     res.json(results); // Send the fetched data as JSON response
//   });
// });
/*app.post('/register', (req, res) => {
  const { name, email, phone, program } = req.body;
  const insertQuery = 'INSERT INTO registrations (name, email, phone, program) VALUES (?, ?, ?, ?)';
  const selectQuery = 'SELECT * FROM registrations WHERE id = ?';

  // First, insert the new registration
  connection.query(insertQuery, [name, email, phone, program], (err, result) => {
    if (err) {
      console.error('Error registering:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const newRegistrationId = result.insertId;

    // Fetch the newly inserted registration data
    connection.query(selectQuery, [newRegistrationId], (selectErr, selectResult) => {
      if (selectErr) {
        console.error('Error fetching registration data:', selectErr);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const registeredUser = selectResult[0];
      console.log('Registration successful:', registeredUser);
      res.json({ message: 'Registration successful', user: registeredUser });
    });
  });
});/*



/*app.get("/emergency_list",(req,res)=> {
    const query = 'SELECT * FROM emergency_list where id=4';

    connection.query(query, (err, results) => {
        if (err) throw err;
        else {
            console.log('emergency_List:', results);
            console.log('Data fetched:', results);
            res.json(results);
        }
    });
})

app.get("/emergency_list",(req,res)=> {
    const query = 'SELECT * FROM emergency_list where id=5';

    connection.query(query, (err, results) => {
        if (err) throw err;
        else {
            console.log('emergency_List:', results);
            console.log('Data fetched:', results);
            res.json(results);
        }
    });
})*/