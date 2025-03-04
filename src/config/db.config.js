let config = {
  db: process.env.MONGO_URL,
  port: process.env.PORT || 4000,
};

module.exports = config;