// webpack.config.js
const path = require('path');

module.exports = {
    mode: 'production',
    entry: './main.js',
    output: {
        library: 'DataVision',
        filename: 'datavision.min.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
