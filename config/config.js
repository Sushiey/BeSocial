module.exports = {
    database: {
      host: 'localhost',
      port: 27017,
      dbName: 'besocial_db'
    },
    server: {
      port: process.env.PORT || 3000
    },
  };
  