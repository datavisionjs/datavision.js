
const customColors = {
  get: function (index){
    const colorLen = this.colors.length;

    const indexToDecimal = (index/colorLen) % 1;
    return this.colors[Math.round(indexToDecimal * colorLen)];
  },

  colors: [
    { name: 'Royal Blue', code: '#4169E1' },
    { name: 'Emerald Green', code: '#008000' },
    { name: 'Coral Orange', code: '#FF6B57' },
    { name: 'Crimson Red', code: '#DC143C' },
    { name: 'Lavender Purple', code: '#E6E6FA' },
    { name: 'Tangerine Orange', code: '#FFA500' },
    { name: 'Turquoise Blue', code: '#40E0D0' },
    { name: 'Bubblegum Pink', code: '#FF69B4' },
    { name: 'Lime Green', code: '#00FF00' },
    { name: 'Amethyst Purple', code: '#9966CC' },
    { name: 'Goldenrod Yellow', code: '#DAA520' },
    { name: 'Aqua Blue', code: '#00FFFF' },
    { name: 'Teal Green', code: '#008080' },
    { name: 'Sapphire Blue', code: '#082567' },
    { name: 'Ruby Red', code: '#E0115F' },
    { name: 'Emerald Green', code: '#50C878' },
    { name: 'Golden Yellow', code: '#FFD700' },
    { name: 'Violet Purple', code: '#8A2BE2' },
    { "name": "Mint Green", "code": "#98FF98" },
    { name: 'Plum Purple', code: '#DDA0DD' },
  ]
}
  
  export default customColors;
  