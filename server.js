const express = require('express');
const mysql = require('mysql')
const cors = require('cors')
//const path = require('path');
const app=express()
app.use(cors())

const connection=mysql.createConnection({
    host:"localhost",
    user:'root',
    password:'',
    database:'emergencyaiddb'
})


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

    connection.query(query, (err, results) => {
        if (err) throw err;
        else {
            console.log('Category List:', results);
            console.log('Data fetched:', results);
            res.json(results);
        }
    });
})

app.get("/emergency_list",(req,res)=> {
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
