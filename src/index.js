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
import { addBars } from './data-visualization/plot-area/scrollbar.js';



function DataVision(targetId) {
    //styles 
    this.rawData = [];
    this.data = [];

    //check if set up chart is called
    this.isSetUpChart = false;

    this.layout = {};
    this.design = {};

    //title 
    this.titleContainer = document.createElement("div");

    //scrolls

    //axisScrolls 
    this.scrollWheelArea = document.createElement("div");
    this.hrScrollBar = document.createElement("div");
    this.vrScrollBar = document.createElement("div");

    this.scrollData = {topIndex: 0, leftIndex: 0, isScrollY: false, isScrollX: false};

    this.legendScrollBar = document.createElement("div");
    this.legendScrollTop = 0;
    this.legendContainer = document.createElement("div");


    this.target = document.getElementById(targetId);
    this.targetCanvas = document.createElement("canvas");

    this.mainContainer = document.createElement("div");

    this.canvasContainer = document.createElement("div");
    this.canvas = document.createElement("canvas");
    this.canvasSize = {width: 1, height: 1};
    this.canvasCopy = document.createElement("canvas");

    this.ctx = null;

    this.tempCanvas = document.createElement("canvas");

    this.toolTipData = [];

    //create canvas for aspect ratio 
    this.createCanvas = function (canvas, width, height) {
        const newCanvas = canvas || document.createElement("canvas");

        const ctx = newCanvas.getContext("2d");

        const ratio = window.devicePixelRatio || 1;

        const ratioWidth = width * ratio;
        const ratioHeight = height * ratio;

        newCanvas.width = ratioWidth;
        newCanvas.height = ratioHeight;

        newCanvas.style.width = width + "px";
        newCanvas.style.height = height + "px";

        ctx.scale(ratio, ratio);
        ctx.clearRect(0, 0, width, height);

        return newCanvas;
    }

    //clear target
    this.clearTarget = function (){
        const target = this.getTarget();
        target.innerHTML = "";
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
                layout.title.lines = Global.splitTitleText(this, titleText);
            }else {
                layout.title = {lines: Global.splitTitleText(this, title)};
            }

            //sub title
            const subTitle = layout.subTitle || "";
            if(Global.isObject(subTitle)){
                const titleText = subTitle.text || "";
                layout.subTitle.lines = Global.splitTitleText(this, titleText);
            }else {
                layout.subTitle = {lines: Global.splitTitleText(this, subTitle)};
            }

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

    //title
    this.getTitleContainer = function (){
        return this.titleContainer;
    }

    //canvas
    this.setCanvas = function (layout){
        const chartArea = Calc.projChartPosition(this);

        const width = chartArea.width, height = chartArea.height;

        const canvas = this.createCanvas(this.getCanvas(), width, height);
        
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvasSize = {width: width, height: height};
    };

    this.getCanvasContainer = function (){
        return this.canvasContainer;
    };
    this.getCanvas = function (){
        return this.canvas;
    };
    this.clearCanvas = function (x, y, width, height){
        const ctx = this.getCtx();
        const layout = this.getLayout();

        const canvasSize = this.getCanvasSize();

        if(ctx){
            const newX = (x || 0), newY = (y || 0);
            const newWidth = (width || canvasSize.width),  newHeight = (height || canvasSize.height);
           
            //set bg color 
            const bgColor = layout.backgroundColor || "transparent";
            const newCanvas = this.createCanvas(null, newWidth, newHeight);
            const newCtx = newCanvas.getContext("2d");
            newCtx.fillStyle = bgColor;
            newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height);
            
            ctx.beginPath();
            ctx.clearRect(newX, newY, newWidth, newHeight);
            ctx.drawImage(newCanvas, newX, newY, newWidth, newHeight);
           
        }
    };
    this.getCanvasSize = function (){
        return this.canvasSize;
    };
    this.addCanvas = function (){

        const canvasContainer = this.getCanvasContainer();
        canvasContainer.style.width = "100%";
        canvasContainer.style.height = "auto";

        const mainContainer = this.getMainContainer();
        //target.style.display = "table-column";

        const canvas = this.getCanvas();

        if(!mainContainer){
            return;
        }

        if(canvasContainer.parentElement !== mainContainer){
            //set style on target 
            mainContainer.style.position = "relative";

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

            Global.on(canvas, "mouseleave", function (){
                let toolTipCard = mainContainer.querySelector("#dv_tooltip");
                toolTipCard? toolTipCard.style.display = "none": null;
            }, "");

            Global.on(document, "click", function (){
                //if not touch screen, update target canvas
                if(!(navigator.maxTouchPoints > 0)){
                    dv.updateTargetCanvas();
                }
            }, "");

            //add canvas to target
            canvasContainer.appendChild(canvas);
            mainContainer.appendChild(canvasContainer);
        }
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
        
        
        const canvasSize = this.getCanvasSize();
        const canvasWidth = canvasSize.width, canvasHeight = canvasSize.height;

        const canvasCopy = this.createCanvas(null, canvasWidth, canvasHeight);
        const ctx = canvasCopy.getContext("2d");

        ctx.drawImage(canvas, 0, 0, canvasWidth, canvasHeight);

        this.canvasCopy = canvasCopy;
    };
    this.getCanvasCopy = function (){
        return this.canvasCopy;
    };

    //2d context 
    this.getCtx = function (){
        return this.ctx || this.getCanvas().getContext("2d");
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

    this.getLegendContainer = function (){
        return this.legendContainer;
    };

    //target 
    this.getTarget = function (){
        return this.target;
    };
    this.getTargetSize = function () {
        const target = this.getTarget();
        const computedStyle = window.getComputedStyle(target);
    
        // Parse padding values
        const paddingTop = parseFloat(computedStyle.paddingTop);
        const paddingBottom = parseFloat(computedStyle.paddingBottom);
        const paddingLeft = parseFloat(computedStyle.paddingLeft);
        const paddingRight = parseFloat(computedStyle.paddingRight);
    
        // Get full dimensions (including padding, borders)
        const boundingRect = target.getBoundingClientRect();
    
        // Calculate content-box width and height
        const contentWidth = boundingRect.width - paddingLeft - paddingRight;
        const contentHeight = boundingRect.height - paddingTop - paddingBottom;
    
        return {
            width: contentWidth,
            height: contentHeight,
        };
    };
    
    this.updateTargetCanvas = function (){
        const canvasCopy = this.getCanvasCopy();

        const canvasSize = this.getCanvasSize();
        const canvasWidth = canvasSize.width, canvasHeight = canvasSize.height;

        const ctx = this.getCtx();

        //ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        this.clearCanvas();
        ctx.drawImage(canvasCopy, 0, 0, canvasWidth, canvasHeight);
    };

    //main container
    this.getMainContainer = function (){
        return this.mainContainer;
    };

    this.addMainContainer = () => {
        const target = this.getTarget();
        const targetSize = this.getTargetSize();
        const mainContainer = this.getMainContainer();

        const width = targetSize.width, height = targetSize.height;
        mainContainer.setAttribute("style", `position: relative; width: ${width}px; height: ${height}px`);
        
        target?.appendChild(mainContainer);
    }


    //clearTarget 
    this.clearTarget();

}

DataVision.prototype.update = function (){
    //clear tooltipData 
    this.clearToolTipData();

    //set data
    /*
    this.setData(this.getRawData());

    //set chart properties
    await Prop.setUpChart(this);*/

    //set canvas 
    this.setCanvas(this.getLayout());

    //set graph position
    Prop.setGraphPosition(this);

    //clear rect
    this.clearCanvas();

    dataVis.DrawPlotArea(this);

    dataVis.Chart(this);

    //update date canvas copy with main canvas
    this.updateCanvasCopy();

    //add main canvas to user target element
    this.addCanvas();

    //add scrollBars
    addBars(this, Calc.projChartPosition(this));

    //Draw dataset names
    DrawLegend(this);

    //add mainCanvas to target
    this.addMainContainer();
};

DataVision.prototype.plot = async function (data, layout){
    //create copy of data and layout
    data = [...data];
    layout = {...layout};

    //clear tooltipData 
    this.clearToolTipData();

    //set data and layout
    //this.setData(data);
    this.setRawData(data);
    this.setData(this.getRawData());

    this.setLayout(layout);

    await Prop.setUpChart(this);

    this.update();
};

export default DataVision;
