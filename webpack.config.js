// webpack.config.js
const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.js', // Adjust the entry file path
    output: {
      library: 'DataVision',
      filename: 'datavision.min.js', // Adjust the output filename
      path: path.resolve(__dirname, 'dist'), // Adjust the output path
    },
};