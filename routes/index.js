module.exports = {
    getHomePage: (req, res) => {
        let query = "SELECT * FROM `users`"; 

        // execute query
        db.query(query, (err, result) => {
            if (err) {
                res.redirect('/');
            }
            console.log(result);
        });
    },
};

