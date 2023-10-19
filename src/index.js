import * as dataVis from './data-visualization/index.js'

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
    canvas.width = 700;
    canvas.height = (700*0.75);

    const ctx = canvas.getContext("2d");

    dataVis.DrawAxis(ctx);

    dataVis.Chart(ctx);

    this.addCanvasToTarget();
}

export default DataVision;
