require('dotenv').config();

const config = {
    client: 'pg',
    connection: process.env.DATABASE_URL || {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    
    // TODO: comments in prodction
    //pool: { min: 2, max: 4 }
    pool: {
        min: 2, 
        max: 10,
        afterCreate: function (conn, done) {
          // in this example we use pg driver's connection API
          conn.query('SET timezone="UTC";', function (err) {
            if (err) {
              // first query failed, return error and don't try to make next query
              done(err, conn);
            } else {
              // do the second query...
              conn.query('SELECT set_limit(0.01);', function (err) {
                // if err is not falsy, connection is discarded from pool
                // if connection aquire was triggered by a query the error is passed to query promise
                done(err, conn);
              });
            }
          });
        }
      }
}

var knex = require('knex')(config);
var bookshelf = require('bookshelf')(knex);

bookshelf.plugin('virtuals');
bookshelf.plugin('visibility');
bookshelf.plugin(require('bookshelf-eloquent'));

knex.migrate.latest();

module.exports = bookshelf;
