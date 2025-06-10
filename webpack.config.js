// webpack.config.js
const path = require('path');

module.exports = {
    entry: './main.js',
    output: {
        filename: 'datavision.min.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
};