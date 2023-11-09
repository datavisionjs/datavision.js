import * as dataVis from './data-visualization/index.js'
import * as Calc from './data-visualization/helpers/math.js';

function DataVision(targetId) {
    //create canvas 
    this.createCanvas = function (){
        return document.createElement("canvas");
    };

    this.target = document.getElementById(targetId);
    this.canvas = this.createCanvas();


    this.addCanvasToTarget = function (){
        const canvas = this.createCanvas();
        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;
        
        const ctx = canvas.getContext("2d");
        ctx.drawImage(this.canvas, 0, 0);
       
        if(this.target){
            this.target.appendChild(canvas);
        }
    };
}

DataVision.prototype.plot = function (data, layout){
    const canvas = this.canvas;
    const canvasWidth = 700;
    const canvasHeight = (canvasWidth*0.75);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext("2d");

    //get the data type of the dataset
    const firstDataType = data[0]? data[0].type: null;


    //set font size 
    const fontSize = 13;
    ctx.font = fontSize+"px Arial";

    layout.isBarChart = firstDataType === "bar"? true: false;
    layout.isPieChart = firstDataType === "pie"? true: false;

    //set layout default settings
    layout.fontSize = fontSize;
    layout.customColorsIndex = 0;
    layout.graphPosition = Calc.graphPosition(canvasWidth, canvasHeight);


    dataVis.DrawPlotArea(ctx, firstDataType);

    dataVis.Chart(ctx);

    this.addCanvasToTarget();
}

export default DataVision;
