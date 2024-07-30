import * as dataVis from './data-visualization/index.js'

//import helpers
import * as Calc from './data-visualization/helpers/math.js';
import GetStyle from './data-visualization/helpers/style.js';
import * as Prop from './data-visualization/helpers/properties.js'
import DisplayToolTip from './data-visualization/helpers/tooltip.js';

//import all global functions 
import * as Global from './data-visualization/helpers/global.js';

//drawdataset names 
import DrawDatasetNames from './data-visualization/plot-area/dataset-names.js';


function DataVision(targetId) {
    //styles 
    this.rawData = [];
    this.data = [];

    this.layout = {};
    this.style = {};

    //scrolls
    this.axisScrollWheelArea = document.createElement("div");
    this.axisHrScrollBar = document.createElement("div");
    this.axisVrScrollBar = document.createElement("div");

    this.axisScroll = {topIndex: 0, leftIndex: 0, isScrollY: false, isScrollX: false};

    this.datasetNamesScrollBar = document.createElement("div");
    this.datasetNamesScrollTop = 0;

    this.target = document.getElementById(targetId);
    this.targetCanvas = document.createElement("canvas");

    this.canvas = document.createElement("canvas");
    this.canvasCopy = document.createElement("canvas");

    this.ctx = null;

    this.tempCanvas = document.createElement("canvas");

    this.toolTipData = [];

    //clear target
    this.clearTarget = function (){
        this.getTarget().innerHTML = "";
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
    this.getAxisScroll = function (){
        return this.axisScroll;
    };
    this.getAxisScrollbar = function (){

        return {
            wheelArea: this.axisScrollWheelArea,
            hr: this.axisHrScrollBar,
            vr: this.axisVrScrollBar
        };
    };


    this.getAxisScrollBarSize = function (){
        const bar = this.getAxisScrollbar();

        const hrHeight = bar.hr? bar.hr.offsetHeight: 0;
        const vrWidth = bar.vr? bar.vr.offsetWidth: 0;

        return {
            vrWidth: vrWidth,
            hrHeight: hrHeight
        };
    };

    this.setAxisScrollContentSize = function (){
        const layout = this.getLayout();

        const labelStyle = this.getStyle().label;
        const fontSize = labelStyle.fontSize;

        const canvas = this.getCanvas();
        const canvasWidth = canvas.width, canvasHeight = canvas.height;

        const graphPosition = layout.graphPosition;
        const graphY = graphPosition.y;
        const graphX = graphPosition.x;
        const graphWidth = graphPosition.width;
        const graphHeight = graphPosition.height;

        const axisScroll = this.getAxisScroll();

        //set barData
        const axisData = layout.axisData;
        const isHorizontal = axisData.direction === "hr";

        const axisValues = isHorizontal? axisData.labels: axisData.values;
        
        for(let key in axisValues){
            const axis = axisValues[key];
            const values = axis.values;

            if(!axis.isAllNumbers){
                let step = (graphWidth/values.length);
                step < fontSize? step = fontSize: null;

                const newContentHeight = ((values.length*fontSize)+(canvasHeight-(graphY+graphHeight))) || 0;
                const contentHeight = axisScroll.contentHeight || 0;

                newContentHeight > contentHeight? axisScroll.contentHeight = newContentHeight: null;
                
            }
        }

        const axisLabels = isHorizontal? axisData.values: axisData.labels;
        for(let key in axisLabels){

            const axis = axisLabels[key];
            const values = axis.values;
    
            if(!axis.isAllNumbers){ 
                let step = (graphWidth/values.length);
                step < fontSize? step = fontSize: null;

                axisScroll.contentWidth = ((fontSize*values.length)+graphX);

            }
        }
    };

    this.setAxisScrollIndex = function (top, left){
        const layout = this.getLayout();
        const axisData = layout? layout.axisData: null;

        const labelStyle = this.getStyle().label || {};
        const fontSize = labelStyle.fontSize || 0;

        const axisScroll = this.getAxisScroll();
        const wheelArea = this.getAxisScrollbar().wheelArea;
        

        if(!isNaN(left)){

            left < 0? left = 0: null;

            let valuesCount = 0;

            const labels = axisData.labels || {};
            for(let key in labels){
                const axis = labels[key];
                const values = axis.values;
                values.length > valuesCount? valuesCount = values.length: null;
            }

            const contentWidth = (valuesCount*fontSize);

            //index is given in decimal
            const index = (left/contentWidth)*valuesCount;

            axisScroll.leftIndex = index;
        }

        if(!isNaN(top)){

            top < 0? top = 0: null;

            let valuesCount = 0;

            const labels = axisData.values || {};
            for(let key in labels){
                const axis = labels[key];
                const values = axis.values;
                values.length > valuesCount? valuesCount = values.length: null;
            }

            const contentWidth = (valuesCount*fontSize);

            const newTop = (top-(wheelArea.scrollHeight-wheelArea.clientHeight));
            //index is given in decimal
            const index = Math.abs((newTop/contentWidth)*valuesCount);

            axisScroll.topIndex = index;
        }
    };

    this.addAxisScrollBars = function (position){
        const layout = this.getLayout();

        const graphPosition = layout.graphPosition;
        const graphWidth = graphPosition.width;
        const graphHeight = graphPosition.height;

        const target = this.getTarget();

        const bar = this.getAxisScrollbar();
        const wheelArea = bar.wheelArea;
        const hrBar = bar.hr;
        const vrBar = bar.vr;

        const content = wheelArea.children[0] || document.createElement("div");

        const axisScroll = this.getAxisScroll();

        const contentWidth = axisScroll.contentWidth || 0, contentHeight = axisScroll.contentHeight || 0;

        const barHasParent = bar.parentElement? true: false;

        if(content){ 
            content.style.width = (contentWidth||1) + "px";
            content.style.height = (contentHeight||1) + "px";
            content.style.border = "0px";
            content.style.margin = "0px";
            content.style.padding = "0px";
            content.style.backgroundColor = "transparent";
        }


        if(wheelArea){
            wheelArea.style.position = "absolute";
            wheelArea.style.left = (position.x||0) + "px";
            wheelArea.style.top = (position.y||0) + "px";
            wheelArea.style.height = (position.height||0) + "px";
            wheelArea.style.width = (position.width||0) +"px";
            wheelArea.style.border = "0px";
            wheelArea.style.margin = "0px";
            wheelArea.style.padding = "0px";
            wheelArea.style.overflow = "auto";
            wheelArea.style.scrollbarWidth = "none";
            wheelArea.style.backgroundColor = "transparent";
        }

        if(hrBar){
            hrBar.style.position = "absolute";
            hrBar.style.left = "0px";
            hrBar.style.top = ((position.y+position.height)||0) + "px";
            hrBar.style.width = (position.width||1) +"px";
            hrBar.style.border = "0px";
            hrBar.style.margin = "0px";
            hrBar.style.padding = "0px";
            hrBar.style.overflow = "auto";
            hrBar.style.backgroundColor = "transparent";
        }

        if(vrBar){
            vrBar.style.position = "absolute";
            vrBar.style.left = (position.x+position.width+2||0) + "px";
            vrBar.style.top = ((position.y)||0) + "px";
            vrBar.style.height = (graphHeight||1) +"px";
            vrBar.style.border = "0px";
            vrBar.style.margin = "0px";
            vrBar.style.padding = "0px";
            vrBar.style.overflow = "auto";
            vrBar.style.backgroundColor = "transparent";
        }
        

        if(target && ((contentWidth > graphWidth) || (contentHeight > graphHeight)) && wheelArea.parentElement !== target){
            const dv = this; //get datavision object

            const scrollAndChart = function (){
                dv.clearToolTipData();
                    
                dv.updateTargetCanvas();

                dataVis.DrawPlotArea(dv);
                dataVis.Chart(dv);
                dv.updateCanvasCopy();
            };

            let timeoutId;
            let isClickScroll = false;
    
            Global.on(wheelArea, "wheel", function (){
                isClickScroll = false;
            }, "");
            Global.on(wheelArea, "scroll", function (){
                dv.setAxisScrollIndex(wheelArea.scrollTop, wheelArea.scrollLeft);
                
                // Clear previous timeout, if any
                clearTimeout(timeoutId);

                // Set a new timeout
                timeoutId = setTimeout(function() {
                    scrollAndChart();

                    hrBar.scrollLeft = wheelArea.scrollLeft;
                    
                    const topScrollPercentage = wheelArea.scrollTop / (wheelArea.scrollHeight - wheelArea.clientHeight);
                    vrBar.scrollTop = (topScrollPercentage * (vrBar.scrollHeight - vrBar.clientHeight));
                    
                }, 10); // Adjust the delay as needed
            }, "");

            Global.on(hrBar, "mousedown", function (){
                isClickScroll = true;
            }, "");
            Global.on(hrBar, "scroll", function (){
                if(isClickScroll){
                    wheelArea.scrollLeft = hrBar.scrollLeft;
                }
            }, "");

            Global.on(vrBar, "mousedown", function (){
                   isClickScroll = true;
            }, "");
            Global.on(vrBar, "scroll", function (){
                if(isClickScroll){
                    const topScrollPercentage = vrBar.scrollTop / (vrBar.scrollHeight - vrBar.clientHeight);
                    wheelArea.scrollTop = (topScrollPercentage * (wheelArea.scrollHeight - wheelArea.clientHeight));
                }
            }, "");

            Global.on(wheelArea, "mousemove", function (){
                this.style.pointerEvents = "none";
            }, "");

            //add content to scroll bars 
            wheelArea.appendChild(content);

            target.appendChild(wheelArea);

            //add horizontal scrollbar
            if(contentWidth > position.width){
                const newContent = content.cloneNode(true);
                hrBar.appendChild(newContent);
                target.appendChild(hrBar);

                const barWidth = hrBar.offsetHeight - hrBar.clientHeight;
                hrBar.style.height = barWidth +"px";
            }
            
            //add vertical scrollbar
            if(contentHeight > position.height){
                const newContent = content.cloneNode(true);
                vrBar.appendChild(newContent);
                target.appendChild(vrBar);

                const barWidth = vrBar.offsetWidth - vrBar.clientWidth;
                vrBar.style.width = barWidth +"px";
            }

            //set axis scroll after adding bar
            !barHasParent? this.setAxisScrollIndex(0, 0): null;

            axisScroll.isScrollX = contentWidth > graphWidth? true: false;
            axisScroll.isScrollY = contentHeight > graphHeight? true: false;
        }
    };

    this.getDatasetNamesScrollTop = function (){
        return this.datasetNamesScrollTop;
    };
    this.setDatasetNamesScrollTop = function (value){
        this.datasetNamesScrollTop = value;
    };

    this.getDatasetNamesScrollBar = function (){
        return this.datasetNamesScrollBar;
    }

    this.addDatasetNamesScrollBar = function (position, contentHeight){
        const target = this.getTarget();
        const bar = this.getDatasetNamesScrollBar();
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
                dv.setDatasetNamesScrollTop(bar.scrollTop);
                
                // Clear previous timeout, if any
                clearTimeout(timeoutId);

                // Set a new timeout
                timeoutId = setTimeout(function() {
                    DrawDatasetNames(dv);
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
                const wheelArea = dv.getAxisScrollbar().wheelArea;
                wheelArea? wheelArea.style.pointerEvents = "": null;
            });

            Global.on(canvas, "mousedown", function (){
                const wheelArea = dv.getAxisScrollbar().wheelArea;
                wheelArea? wheelArea.style.pointerEvents = "": null;
            }, "touchstart");

            Global.on(canvas, "mousemove", function (event){

                event.stopPropagation();
                const mousePosition = Global.getMousePosition(event);
                DisplayToolTip(event, dv, mousePosition);

            }, "");

            Global.on(document, "click", function (){
                dv.updateTargetCanvas();
            }, "touchend");

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
    DrawDatasetNames(this);

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

    //set styles
    this.setStyle();

    //set data and layout
    //this.setData(data);
    this.setRawData(data);

    this.setLayout(layout);

    this.update();
};

export default DataVision;
