import * as dataVis from './data-visualization/index.js'
import * as Calc from './data-visualization/helpers/math.js';

function DataVision(targetId) {
    //styles 
    this.data = [];
    this.layout = {};

    this.target = document.getElementById(targetId);
    this.canvas = document.createElement("canvas");

    //setter and getter 

    //data 
    this.setData = function (data){
        //set data to a new data
        this.data = [...data];
    };
    this.getData = function (){
        return this.data;
    };

    //layout
    this.setLayout = function (layout){

        if(layout){
            //get the data type of the dataset
            const data = this.getData();

            const firstDataType = data[0]? data[0].type: null;

            const canvas = this.getCanvas();
            const width = canvas.width, height = canvas.height;

            const graphPosition = Calc.graphPosition(firstDataType, width, height);

            layout.isBarChart = firstDataType === "bar"? true: false;
            layout.isPieChart = firstDataType === "pie"? true: false;

            //set layout default settings
            layout.fontSize = 13;
            layout.customColorsIndex = 0;
            layout.firstDataType = firstDataType;
            layout.graphPosition = graphPosition;
            

            //set layout to new layout
            this.layout = {...layout};
        }
    };
    this.getLayout = function (){
        return this.layout;
    };

    //canvas
    this.updateCanvas = function (width, height){
        const canvas = this.canvas;

        canvas.width = width;
        canvas.height = height;

        this.canvas = canvas;
    };
    this.getCanvas = function (){
        return this.canvas;
    };

    //2d context 
    this.getCtx = function (){
        return this.getCanvas().getContext("2d");
    };

    this.addCanvasToTarget = function (){
        const canvas = document.createElement("canvas");
        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;
        
        const ctx = canvas.getContext("2d");
        ctx.drawImage(this.getCanvas(), 0, 0);
       
        if(this.target){
            this.target.innerHTML = "";
            this.target.appendChild(canvas);
        }
    };

}

DataVision.prototype.plot = function (data, layout){
    const canvasWidth = 700;
    const canvasHeight = (canvasWidth*0.75);

    this.updateCanvas(canvasWidth, canvasHeight);

    //set data and layout
    this.setData(data);
    this.setLayout(layout);

    dataVis.DrawPlotArea(this);

    dataVis.Chart(this);

    this.addCanvasToTarget();
}

export default DataVision;
