import * as dataVis from './data-visualization/index.js'

//import helpers
import * as Calc from './data-visualization/helpers/math.js';
import Design from './data-visualization/helpers/design.js';
import * as Prop from './data-visualization/helpers/properties.js'
import DisplayToolTip from './data-visualization/helpers/tooltip.js';

//import all global functions 
import * as Global from './data-visualization/helpers/global.js';

//drawdataset names 
import DrawLegend from './data-visualization/plot-area/legend.js';



function DataVision(targetId) {
    //styles 
    this.rawData = [];
    this.data = [];

    this.layout = {};
    this.design = {};

    //scrolls

    //axisScrolls 
    this.scrollWheelArea = document.createElement("div");
    this.hrScrollBar = document.createElement("div");
    this.vrScrollBar = document.createElement("div");

    this.scrollData = {topIndex: 0, leftIndex: 0, isScrollY: false, isScrollX: false};

    this.legendScrollBar = document.createElement("div");
    this.legendScrollTop = 0;


    this.target = document.getElementById(targetId);
    this.targetCanvas = document.createElement("canvas");

    this.canvas = document.createElement("canvas");
    this.canvasCopy = document.createElement("canvas");

    this.ctx = null;

    this.tempCanvas = document.createElement("canvas");

    this.toolTipData = [];

    //clear target
    this.clearTarget = function (){
        const target = this.getTarget();
        target? target.innerHTML = "": null;
    }
    
    //setter and getter 

    //data 
    this.setRawData = function (data){
        this.rawData = data;
    }
    this.getRawData = function (){
        return this.rawData;
    }

    this.setData = function (data){
        //set data to a new data
        this.data = data;
    };
    this.getData = function (){
        return [...this.data];
    };

    //layout
    this.setLayout = function (layout){

        if(layout){
            //get the data type of the dataset
            //const data = this.getData();

            //set general designs
            this.setDesign(layout);

            //set title text to multiple lines 
            const title = layout.title || "";
            if(Global.isObject(title)){
                const titleText = title.text || "";
                layout.title.titleLines = Global.splitTitleText(this, titleText);
            }else {
                layout.title = {titleLines: Global.splitTitleText(this, title)};
            }

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

    this.setDesign = function (layout){
        this.design = Design(this, layout);
    };
    this.getDesign = function (){
        return this.design;
    };

    //canvas
    this.setCanvas = function (width, height){
        const canvas = this.getCanvas();

        canvas.width = width;
        canvas.height = height;

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    };
    this.getCanvas = function (){
        return this.canvas;
    };

    //tooltip 
    this.setToolTipData = function (data){
        this.toolTipData.push(data);
    };
    this.getToolTipData = function (){
        return this.toolTipData;
    };
    this.clearToolTipData = function (){
        this.toolTipData = [];
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
        return this.ctx;
    };

    this.getTempCanvas = function (){
        return this.tempCanvas;
    };

    //scrolls 
    this.getScrollData = function (){
        return this.scrollData;
    };
    this.getScrollbar = function (){

        return {
            wheelArea: this.scrollWheelArea,
            hr: this.hrScrollBar,
            vr: this.vrScrollBar
        };
    };

    this.getLegendScrollTop = function (){
        return this.legendScrollTop;
    };
    this.setLegendScrollTop = function (value){
        this.legendScrollTop = value;
    };

    this.getLegendScrollBar = function (){
        return this.legendScrollBar;
    }

    this.addLegendScrollBar = function (position, contentHeight){
        const target = this.getTarget();
        const bar = this.getLegendScrollBar();
        const content = bar.children[0] || document.createElement("div");

        if(content){ 
            content.style.height = (contentHeight||0) + "px";
            content.style.border = "0px";
            content.style.margin = "0px";
            content.style.padding = "0px";
            content.style.backgroundColor = "transparent";
        }

        if(bar){
            bar.style.position = "absolute";
            bar.style.left = (position.x||0) + "px";
            bar.style.top = (position.y||0) + "px";
            bar.style.height = (position.height||0) + "px";
            bar.style.width = (position.width||0) +"px";
            bar.style.border = "0px";
            bar.style.margin = "0px";
            bar.style.padding = "0px";
            bar.style.overflowY = "auto";
            bar.style.backgroundColor = "transparent";
        }
        
        if(target && (contentHeight > position.height) && bar.parentElement !== target){
            const dv = this; //get datavision object
            let timeoutId;
            Global.on(bar, "scroll", function (){
                dv.setLegendScrollTop(bar.scrollTop);
                
                // Clear previous timeout, if any
                clearTimeout(timeoutId);

                // Set a new timeout
                timeoutId = setTimeout(function() {
                    DrawLegend(dv);
                    dv.updateCanvasCopy();
                }, 10); // Adjust the delay as needed

            }, "");

            bar.appendChild(content);
            target.appendChild(bar);
        }
    };

    //target 
    this.getTarget = function (){
        return this.target;
    };

    this.getTargetCanvas = function (){
        return this.getTarget().getElementsByTagName("canvas")[0];
    };
    this.updateTargetCanvas = function (){
        const canvasCopy = this.getCanvasCopy();
        //const canvas = this.getTargetCanvas();

        const ctx = this.getCtx();

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.drawImage(canvasCopy, 0, 0);
    };
    this.addCanvasToTarget = function (){
        const target = this.getTarget();
        const canvas = this.getCanvas();

        if(!target){
            return;
        }

        if(canvas.parentElement !== target){
            //set style on target 
            target.style.position = "relative";

            //set event on canvas
            const dv = this; //get datavision object
            
            Global.on(canvas, "wheel", function (){
                const wheelArea = dv.getScrollbar().wheelArea;
                wheelArea? wheelArea.style.pointerEvents = "": null;
            });

            Global.on(canvas, "mousedown", function (){
                const wheelArea = dv.getScrollbar().wheelArea;
                wheelArea? wheelArea.style.pointerEvents = "": null;
            }, "touchstart");

            Global.on(canvas, "mousemove", function (event){

                event.stopPropagation();
                const mousePosition = Global.getMousePosition(event);
                DisplayToolTip(event, dv, mousePosition);
            }, "touchend");

            Global.on(document, "click", function (){
                //if not touch screen, update target canvas
                if(!(navigator.maxTouchPoints > 0)){
                    dv.updateTargetCanvas();
                }
            }, "");

            //add canvas to target
            target.appendChild(canvas);
        }
    };

    //clearTarget 
    this.clearTarget();

}

DataVision.prototype.update = function (){
    //clear tooltipData 
    this.clearToolTipData();

    //set data
    this.setData(this.getRawData());

    //set chart properties
    Prop.setUpChart(this);
    Prop.setGraphPosition(this);
    
    //Draw dataset names
    DrawLegend(this);

    dataVis.DrawPlotArea(this);

    dataVis.Chart(this);

    //update date canvas copy with main canvas
    this.updateCanvasCopy();

    //add main canvas to user target element
    this.addCanvasToTarget();
};

DataVision.prototype.plot = function (data, layout){
    //clear tooltipData 
    this.clearToolTipData();

    const chartArea = Calc.getChartArea(this, layout);

    this.setCanvas(chartArea.width, chartArea.height);

    //set data and layout
    //this.setData(data);
    this.setRawData(data);

    this.setLayout(layout);

    this.update();
};

export default DataVision;
