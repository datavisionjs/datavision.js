import * as dataVis from './data-visualization/index.js'

//import helpers
import * as Calc from './data-visualization/helpers/math.js';
import GetStyle from './data-visualization/helpers/style.js';
import * as Prop from './data-visualization/helpers/properties.js'
import DisplayToolTip from './data-visualization/helpers/tooltip.js';

//import all global functions 
import * as Global from './data-visualization/helpers/global.js';


function DataVision(targetId) {
    //styles 
    this.data = [];
    this.layout = {};
    this.style = {};

    this.target = document.getElementById(targetId);
    this.targetCanvas = document.createElement("canvas");

    this.canvas = document.createElement("canvas");
    this.canvasCopy = document.createElement("canvas");

    this.tempCanvas = document.createElement("canvas");

    //setter and getter 

    //data 
    this.setData = function (data){
        //set data to a new data
        this.data = data;
    };
    this.getData = function (){
        return this.data;
    };

    //layout
    this.setLayout = function (layout){

        if(layout){
            //get the data type of the dataset
            //const data = this.getData();

            //const firstDataType = data[0]? data[0].type: null;

            //set title text to multiple lines 
            const titleText = layout.title? layout.title: "";
            layout.titleLines = Global.splitTitleText(this, titleText);

            //layout.isBarChart = firstDataType === "bar"? true: false;
            //layout.isPieChart = firstDataType === "pie"? true: false;

            //set layout default settings
            layout.customColorsIndex = 0;

            //set layout to new layout
            this.layout = {...layout};

        }
    };
    this.getLayout = function (){
        return this.layout;
    };

    this.setStyle = function (){
        this.style = GetStyle(this);
    };
    this.getStyle = function (){
        return this.style;
    };

    //canvas
    this.setCanvas = function (width, height){
        const canvas = this.getCanvas();

        canvas.width = width;
        canvas.height = height;

        this.canvas = canvas;
    };
    this.getCanvas = function (){
        return this.canvas;
    };


    this.updateCanvasCopy = function (){
        const canvas = this.getCanvas();

        const canvasCopy = this.getCanvasCopy();
        canvasCopy.width = canvas.width;
        canvasCopy.height = canvas.height;

        const ctx = canvasCopy.getContext("2d");

        ctx.drawImage(canvas, 0, 0);

        this.canvasCopy = canvasCopy;
    };
    this.getCanvasCopy = function (){
        return this.canvasCopy;
    };

    //2d context 
    this.getCtx = function (){
        return this.getCanvas().getContext("2d");
    };

    this.getTempCanvas = function (){
        return this.tempCanvas;
    };

    //target 
    this.getTarget = function (){
        return this.target;
    };

    this.getTargetCanvas = function (){
        return this.targetCanvas;
    };
    this.updateTargetCanvas = function (){
        const canvasCopy = this.getCanvasCopy();
        const canvas = this.getTargetCanvas();

        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(canvasCopy, 0, 0);
    };
    this.addCanvasToTarget = function (){
        const canvas = this.getTargetCanvas();
        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;
        
        const ctx = canvas.getContext("2d");
        ctx.drawImage(this.getCanvas(), 0, 0);

        //set event on canvas
        const dv = this; //get datavision object
        Global.on(canvas, "mousemove", function (event){
            const mousePosition = Global.getMousePosition(event);
            DisplayToolTip(dv, mousePosition);
        }, "touchend");
       
        if(this.target){
            this.target.innerHTML = "";
            this.target.appendChild(canvas);
        }
    };

}

DataVision.prototype.plot = function (data, layout){
    
    const chartArea = Calc.getChartArea(this, layout);

    this.setCanvas(chartArea.width, chartArea.height);

    //set styles
    this.setStyle();

    //set data and layout
    this.setData(data);
    this.setLayout(layout);

    dataVis.DrawPlotArea(this);

    dataVis.Chart(this);

    //update date canvas copy with main canvas
    this.updateCanvasCopy();

    //add main canvas to user target element
    this.addCanvasToTarget();
}

export default DataVision;
