import * as dataVis from '../index.js'
import * as Global from '../helpers/global.js';

export const getBarSize = function (dv){
    const bar = dv.getScrollbar();

    const hrHeight = bar.hr? bar.hr.offsetHeight: 0;
    const vrWidth = bar.vr? bar.vr.offsetWidth: 0;

    return {
        vrWidth: vrWidth,
        hrHeight: hrHeight
    };
};

export const setContentSize = function (dv){
    const layout = dv.getLayout();

    const design = dv.getDesign();
    const font = design.font;
    const fontSize = font.size;

    const canvas = dv.getCanvas();
    const canvasWidth = canvas.width, canvasHeight = canvas.height;

    const graphPosition = layout.graphPosition;
    const graphY = graphPosition.y;
    const graphX = graphPosition.x;
    const graphWidth = graphPosition.width;
    const graphHeight = graphPosition.height;

    const scrollData = dv.getScrollData();

    /*
    //set barData
    const axisData = layout.axisData;
    const isHorizontal = axisData.direction === "hr";
    */

    if(layout.hasAxisData){
        const valuesCount = scrollData.valuesCount;
        const labelsCount = scrollData.labelsCount;

        scrollData.contentHeight = ((valuesCount*fontSize)+(canvasHeight-(graphY+graphHeight))) || 0;
        scrollData.contentWidth = ((fontSize*labelsCount)+graphX);
    }else if(layout.hasTableData){
        const tableData = layout.tableData;
        //const columnWidth = tableData.columnWidth || [];
        //const columnWidthSum = Calc.sum(columnWidth);

        const header = tableData.header;
        const data = tableData.data;
    
        const columnCount = tableData.columnCount;
        const rowCount = tableData.rowCount;

        const maxWidth = tableData.maxValueWidth;
    
        const headerFont = header.font? header.font: {};
        const thFontSize = headerFont.fontSize? headerFont.fontSize: fontSize;
        const thRowHeight = (thFontSize+fontSize);
    
        const dataFont = data.font? data.font: {};
        const tdFontSize = dataFont.fontSize? dataFont.fontSize: fontSize;
        const tdRowHeight = (tdFontSize+fontSize);

        scrollData.contentHeight = (thRowHeight+(tdRowHeight*(rowCount-1)));
        scrollData.contentWidth = 0;
    }

    /*
    const axisValues = isHorizontal? axisData.labels: axisData.values;
    for(let key in axisValues){
        const axis = axisValues[key];
        const values = axis.values;

        if(!axis.isAllNumbers){
            let step = (graphWidth/values.length);
            step < fontSize? step = fontSize: null;

            const newContentHeight = ((values.length*fontSize)+(canvasHeight-(graphY+graphHeight))) || 0;
            const contentHeight = scrollData.contentHeight || 0;

            newContentHeight > contentHeight? scrollData.contentHeight = newContentHeight: null;
            
        }
    }

    const axisLabels = isHorizontal? axisData.values: axisData.labels;
    for(let key in axisLabels){

        const axis = axisLabels[key];
        const values = axis.values;

        if(!axis.isAllNumbers){ 

            scrollData.contentWidth = ((fontSize*values.length)+graphX);

        }
    }*/
};
/*
export const setIndex = function (dv, top, left){
    const layout = dv.getLayout();
    const axisData = layout? layout.axisData: null;

    const labelStyle = dv.getStyle().label || {};
    const fontSize = labelStyle.fontSize || 0;

    const srollData = dv.getScrollData();
    const wheelArea = dv.getScrollbar().wheelArea;
    

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

        srollData.leftIndex = index;
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

        srollData.topIndex = index;
    }
};
*/
export const setIndex = function (dv, top, left){

    const layout = dv.getLayout();
    const axisData = layout? layout.axisData: null;

    const design = dv.getDesign();
    const font = design.font;
    const fontSize = font.size;

    const scrollData = dv.getScrollData();
    const wheelArea = dv.getScrollbar().wheelArea;
    

    if(!isNaN(left)){

        left < 0? left = 0: null;

        let index = 0;

        if(layout.hasAxisData){
            const valuesCount = scrollData.labelsCount || 0;
            const contentWidth = (valuesCount*fontSize);

            //index is given in decimal
            index = (left/contentWidth)*valuesCount;
        }else if(layout.hasTableData){
            const tableData = layout.tableData;
        
            const columnCount = tableData.columnCount;
    
            const contentWidth = scrollData.contentWidth;
            index = Math.abs((left/contentWidth)*columnCount);
        }

        scrollData.leftIndex = index;
    }

    if(!isNaN(top)){

        top < 0? top = 0: null;

        //index is given in decimal
        let index = 0;

        if(layout.hasAxisData){
            const newTop = (top-(wheelArea.scrollHeight-wheelArea.clientHeight));
            const valuesCount = scrollData.valuesCount || 0;

            const contentHeight = (valuesCount*fontSize);
            index = Math.abs((newTop/contentHeight)*valuesCount);
        }else if(layout.hasTableData){
            const tableData = layout.tableData;
        
            const rowCount = tableData.rowCount;
    
            const contentHeight = scrollData.contentHeight;

            index = Math.abs((top/contentHeight)*rowCount);
        }

        scrollData.topIndex = index;
    }
};

export const addBars = function (dv, position){

    const layout = dv.getLayout();

    const canvas = dv.getCanvas();
    const canvasWidth = canvas.width, canvasHeight = canvas.height;

    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width;
    const graphHeight = graphPosition.height;

    const target = dv.getTarget();

    const bar = dv.getScrollbar();
    const wheelArea = bar.wheelArea;
    const hrBar = bar.hr;
    const vrBar = bar.vr;

    const content = wheelArea.children[0] || document.createElement("div");

    const scrollData = dv.getScrollData();

    const contentWidth = scrollData.contentWidth || 0, contentHeight = scrollData.contentHeight || 0;

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
        wheelArea.style.height = ((canvasHeight-graphY)||0) + "px";
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
        hrBar.style.left = (graphX)+"px";
        hrBar.style.top = ((canvasHeight)||0) + "px";
        hrBar.style.width = ((position.width-graphX)||1) +"px";
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
        vrBar.style.height = (position.height||1) +"px";
        vrBar.style.border = "0px";
        vrBar.style.margin = "0px";
        vrBar.style.padding = "0px";
        vrBar.style.overflow = "auto";
        vrBar.style.backgroundColor = "transparent";
    }
    

    if(target && ((contentWidth > graphWidth) || (contentHeight > graphHeight)) && wheelArea.parentElement !== target){

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
            setIndex(dv, wheelArea.scrollTop, wheelArea.scrollLeft);
            
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
        !barHasParent? setIndex(dv, 0, 0): null;

        scrollData.isScrollX = contentWidth > graphWidth? true: false;
        scrollData.isScrollY = contentHeight > graphHeight? true: false;
    }
};