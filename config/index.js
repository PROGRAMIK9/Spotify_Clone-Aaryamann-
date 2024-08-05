const dotenv = require('dotenv');

// Load environment variables from a .env file
dotenv.config();

// Define and retrieve environment variables
const config = {
    URI: process.env.URI || 'defaultUri',
    PORT: parseInt(process.env.PORT || '3000', 10),
    SECRET_ACCESS_TOKEN: process.env.SECRET_ACCESS_TOKEN || 'defaultSecret',
};

module.exports = config;
