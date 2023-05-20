const express = require('express');
const app = express();
const db = require('../database.js');

app.use('/auth/stats/get/*', (err, res, next) => {
    let query = 'SELECT * FROM Statistics'
    db.query(query, (error, result) => {
        if (error)
            return error;
        else {
            console.log(" GET ROUTE CALLED")
            res.locals.data = result;
            next();
        }
    })
});

app.post('/auth/stats/get/visit_count', (err, res) => {
    console.log("  Getting visit count ROUTE CALLED")
    data = res.locals.data;
    res.send(data[0])
})

//app.post('/stats/set/visit_count');

function initialize_statistics_table() {
    let query = 'SELECT * FROM Statistics';
    db.query(query, (error, result) => {
        if (error)
            return error;
        if (result)
            if (result.length == 0) {
                query = `INSERT INTO Statistics (stat_id, stat_name, stat_value1, canExpire) VALUES (1, 'uniqueVisits', 0, 0);`;
                db.query(query, (err, res) => {
                    if (err)
                        return err;
                });
            }
    });
}

module.exports = app