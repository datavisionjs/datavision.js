import * as Calc from '../helpers/math.js'
import * as Global from '../helpers/global.js';

//import elements
import * as Bars from './bars.js';
import DrawLines from './lines.js';
import DrawPoints from "./points";
import DrawPieSlice from './pie.js';
import DrawCell from './cell.js';

import customColors from '../helpers/colors.js';

const DrawElements = (dv, dataset) => {

    const layout = dv.getLayout();

    const ctx = dv.getCtx();

    const canvas = dv.getCanvas();

    const canvasSize = dv.getCanvasSize();
    const canvasWidth = canvasSize.width, canvasHeight = canvasSize.height;


    const tempCanvas = dv.createCanvas(null, canvasWidth, canvasHeight);
    const tempCtx = tempCanvas.getContext("2d");

    const design = dv.getDesign();
    const font = design.font;

    const fontSize = font.size;

    const type = dataset.type;
    const mode = dataset.mode;
    const customData = dataset.custom;
    const isHorizontal = dataset.direction === "hr";

    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    const axisData = layout.axisData;
    const scrollData = dv.getScrollData();
    
    //const scrollIndex = isHorizontal? scrollData.topIndex: scrollData.leftIndex;

    const topIndex = Math.floor(scrollData.topIndex >= 1? (scrollData.topIndex-1): 0), leftIndex = Math.floor(scrollData.leftIndex >= 1? (scrollData.leftIndex-1): 0);
    const topIndexEnd = Math.ceil((topIndex + 2) + (graphHeight/fontSize));
    const leftIndexEnd = Math.ceil((leftIndex + 2) + (graphWidth/fontSize));

    const topIndexDiff = Math.abs(topIndexEnd-topIndex), leftIndexDiff = Math.abs(leftIndexEnd-leftIndex);


    const axisChartTypes = Global.getAxisChartTypes();

    //set line cap and join
    tempCtx.lineCap = "round";
    tempCtx.lineJoin = "round";

    if(axisChartTypes.includes(type)){
        const isLoopLeftAxis = (scrollData.isScrollX || !axisData.xData["x1"].isAllNumbers) && ((leftIndexDiff > topIndexDiff) || axisData.yData["y1"].isAllNumbers);

        const scrollIndex = isLoopLeftAxis? leftIndex: topIndex;
        const scrollIndexEnd = isLoopLeftAxis? leftIndexEnd: topIndexEnd;

        if(type === "bar"){

            const barDataset = dataset.dataset;

            const maxBarPerLabel = barDataset.length;

            const graphLength = isHorizontal? graphHeight: graphWidth;

            const stackLastValues = new Map();
            
            for(let i = 0; i < barDataset.length; i++){

                const barData = barDataset[i];
                //set barData direction 
                barData.direction = dataset.direction;

                const yAxis = axisData.yData[barData.yAxis];
                const xAxis = axisData.xData[barData.xAxis];

                const baseAxis = isHorizontal? yAxis: xAxis;

                const tickFormat = {label: xAxis.tickFormat, value: yAxis.tickFormat};

                const labelCount = baseAxis.values.length;

                let step = (graphLength/labelCount);
                step < fontSize? step = fontSize: null;

                const isStack = mode === "stack";
                let barSize = isStack? step: (step/(maxBarPerLabel));

                //set the bar size given how far apart each bar is from each other (eliminating overlapping bars)
                
                if(baseAxis.isAllNumbers){
                    const range = baseAxis.range;
                    const rangeStart = range[0], rangeEnd = range[1];

                    const rangeLength = (rangeEnd-rangeStart);

                    const datasetBarSize = dataset.barSize;

                    const newBarSize = datasetBarSize? ((datasetBarSize/rangeLength)*graphLength): null;

                    barSize = newBarSize? isStack? newBarSize: (newBarSize/maxBarPerLabel): barSize;

                }

                const designSize = barData.design.size;
                const designColor = barData.design.color;

                tempCtx.fillStyle = designColor;

                const range = isHorizontal? xAxis.range: yAxis.range;
                const rangeStart = Calc.getNumberInRange(0, range);

            
                const barObject = barData.dataPoints;
                //const barValues = Array.from(barObject.values());
                //const keys = Array.from(barObject.keys());

                const labels = isHorizontal? yAxis.values: xAxis.values;

                //const loopEnd = baseAxis.isAllNumbers?  barObject.size: scrollIndexEnd <  barObject.size? scrollIndexEnd:  barObject.size;
                const loopEnd = scrollIndexEnd <  barObject.size? scrollIndexEnd:  barObject.size;

                for(let index = scrollIndex; index < loopEnd; index++){

                    const key = labels[index];
                    let value = barObject.get(key);

                    const size = Array.isArray(designSize)? designSize[(index>=designSize.length? 0: index)]: designSize;
                    const newBarSize = barSize * Global.defaultIfNull(size, 0.8);
                    
                    Array.isArray(value)? value = value[0]: null;
                    Array.isArray(designColor)? tempCtx.fillStyle = designColor[(index>=designColor.length? 0: index)]: null;
                    
                    if(mode === "stack"){

                        const lastStack = stackLastValues.has(key)? stackLastValues.get(key): [rangeStart, rangeStart];
                        const lastValue = value >= 0? (lastStack[0]): (lastStack[1]);
                        
                        const currentValue = value;
                        value = i === 0? value: (lastValue+value);

                        const currentStack = value >= 0? [value, lastStack[1]]: [lastStack[0], currentValue];
                        stackLastValues.set(key, currentStack);

                        Bars.Stack(dv, tempCtx, barData, newBarSize, key, lastValue, value, currentValue, customData, tickFormat);
                    }else {
                        Bars.Group(dv, tempCtx, barData, i, key, value, newBarSize, maxBarPerLabel, customData, tickFormat);
                    }

                }
            }

        }else {

            if(dataset){

                const valueAxisName = dataset.yAxis? dataset.yAxis: "y1";
                const labelAxisName = dataset.xAxis? dataset.xAxis: "x1";
    
                const xAxis = axisData.xData[labelAxisName];
                const yAxis = axisData.yData[valueAxisName];
    
                const labelTitle = layout["xAxis"]? layout["xAxis"].title: null;
    
                const datasetName = dataset.name || "";
    
                const designColor = dataset.design.color;
                const designSize = dataset.design.size || 3;
                const designText = dataset.design.text; // for tooltip text
    
                tempCtx.fillStyle = designColor;
                tempCtx.strokeStyle = designColor;
    
                const xAxisIsAllNumbers = xAxis.isAllNumbers;
                const yAxisIsAllNumbers = yAxis.isAllNumbers;

                const xAxisIsLabel = (!xAxisIsAllNumbers || yAxisIsAllNumbers);
    
                //set xValues to categoryMidPoints if it is a barChart, to be used for mixed charts
                //const labels = isHorizontal? dataset.values: dataset.labels;
                const dataPoints = dataset.dataPoints;
                const labels = xAxisIsLabel? xAxis.values: yAxis.values;
                const values = xAxisIsLabel? yAxis.values: xAxis.values;

                const labelIsAllNumbers = xAxisIsLabel? xAxisIsAllNumbers: yAxisIsAllNumbers;

    
                //const values = isHorizontal? dataset.labels: dataset.values? dataset.values: [];
                
                let darwEndedHere = false;
                if(labels){
                    
                    let isDrawStarted = false;
                    let lastPosition = {x: null, y: null}, positionType;
    
                    //const loopStart = (Math.floor(scrollIndex) - (Math.floor(scrollIndex) > 0? 1: 0));
    
                    const loopStart = (scrollIndex);
                    const loopEnd = labelIsAllNumbers? labels.length: scrollIndexEnd < labels.length? scrollIndexEnd: labels.length;
                    
                    for(var i = loopStart; i < loopEnd; i++){
    
                        const tempLabel = labels[i];
                        const tempValue = Global.defaultIfNull(dataPoints.get(tempLabel), values[i]);

                        let value = yAxisIsAllNumbers? tempValue: tempLabel;
                        let label = yAxisIsAllNumbers? tempLabel: tempValue;
    
                        const prevI = (i-1);
                        let prevLabel = Global.defaultIfNull(labels[prevI], tempLabel);
                        let prevValue = Global.defaultIfNull(dataPoints.get(prevLabel), value);
    
                        const nextI = (i+1);
                        let nextLabel = Global.defaultIfNull(labels[nextI], tempLabel);
                        let nextValue = Global.defaultIfNull(dataPoints.get(nextLabel), value);
    
                        const color = Array.isArray(designColor)? designColor[i]? designColor[i]: designColor[0]: designColor;
                        const size = Array.isArray(designSize)? designSize[i]: designSize;
                        const text = Array.isArray(designText)? designText[i]: designText;
                        
                        positionType = i === loopStart? "start": i === (loopEnd-1)? "end": "";
                        
                        if(value || value === 0){ //proceed if y is valid
                            
                            const prevPosition = Calc.getAxisPosition(dv, prevLabel, prevValue, valueAxisName, labelAxisName);
                            const position = Calc.getAxisPosition(dv, label, value, valueAxisName, labelAxisName);
                            const nextPosition = Calc.getAxisPosition(dv, nextLabel, nextValue, valueAxisName, labelAxisName);
    
                            let positionIsOut = false;
    
                            if(type === "line"){
    
                                //const boundPosition = Calc.findAxisBoundPositions(dv, i, labels, values, valueAxisName, labelAxisName, lastPosition, isDrawStarted, loopStart, loopEnd);
                                
                                positionIsOut = Calc.posIsOutOfBound(dv, prevPosition) && Calc.posIsOutOfBound(dv, position) && Calc.posIsOutOfBound(dv, nextPosition);
                                const isCurrentPositionOut = Calc.posIsOutOfBound(dv, position);
                                
                                if((positionIsOut && isDrawStarted) || (isCurrentPositionOut && (position.x === lastPosition.x || position.y === lastPosition.y))){
                                    tempCtx.stroke();
                                    tempCtx.closePath();
                                    break;
                                }else {
                                    
                                    if(!positionIsOut){
                                        !isDrawStarted? positionType = "start": null;
                                        positionIsOut = Calc.posIsOutOfBound(dv, position);
                                       
                                        isDrawStarted = true;
    
    
                                        DrawLines(dv, tempCtx, dataset, positionType, size, position, positionIsOut);
                                        lastPosition = position;
                                    }
                                }
                                
    
                            }else if(type === "scatter" || type === "bubble"){
                                
                                positionIsOut = Calc.posIsOutOfRange(dv, label, value, labelAxisName, valueAxisName) || Calc.posIsOutOfBound(dv, position);
                                
                                if(!positionIsOut){
    
                                    const designLine = dataset.design.line;
                                    const lineColor = designLine? designLine.color? designLine.color: color: color;
                                    const lineSize = designLine? designLine.size? designLine.size: 0: 0;
                                    
                                    //set line color and size
                                    tempCtx.fillStyle = color;
                                    tempCtx.strokeStyle = lineColor;
                                    tempCtx.lineWidth = lineSize;
    
                                    
                                    DrawPoints(dv, tempCtx, size, position);
                                }
                            }
    
                            
                            //set tooltip
                            const customDataPoints = dataset.customDataPoints;
                            const tickFormat = {label: xAxis.tickFormat, value: yAxis.tickFormat};
                            
                            if(!positionIsOut){
                                dv.setToolTipData({
                                    type: type,
                                    point: { radius: size, midPoint: position },
                                    text: [
                                        { name: labelTitle, value: label },
                                        { name: datasetName, value: value },
                                        ...(type === "bubble" ? [{ name: text, value: size }] : []),  // Conditionally add for "bubble"
                                        ...customDataPoints.get(label).map((value, index) => {
                                            return {name: customData[index].name || "", value: value};
                                        })
                                    ],
                                    hover: {
                                        color: color
                                    },
                                    format: tickFormat,
                                });
                            }
                            //!positionIsOut? dv.setToolTipData({type: type, radius: size, midPoint: position, label: label, value: value, labelName: labelTitle, valueName: datasetName, size: type === "bubble"? size: null, sizeName: text, color: color, tickFormat: tickFormat}): null;
                            
    
                        }else {
                            //draw what lines drawn
                            tempCtx.stroke();
    
                            //close whatever path drawn
                            tempCtx.closePath();
                        }
                    }
    
                }
    
            }
            
        }

        tempCtx.clearRect(0, 0, canvasWidth, graphY); //clear top
        tempCtx.clearRect(0, 0, graphX, canvasHeight); //clear left
        tempCtx.clearRect((graphX+graphWidth), 0, canvasWidth, canvasHeight); //clear right
        tempCtx.clearRect(0, (graphY+graphHeight), canvasWidth, canvasHeight); //clear bottom


        ctx.drawImage(tempCanvas, 0, 0, canvasWidth, canvasHeight);

    }else if(type === "pie"){

        const tickFormat = {label: dataset.labelLayout.tickFormat, value: dataset.valueLayout.tickFormat};

        const radius = (Math.min(graphWidth, graphHeight)/2);

        const pieData = dataset.data;
        const sortedLabels = dataset.sortedLabels;

        let sumOfValues = dataset.sumOfValues;

        const hole = dataset.hole? dataset.hole: 0;
        const holeRadius = (hole*radius);

        let degrees = -90;
        let startDegrees = degrees;

        for (let index = 0; index < sortedLabels.length; index++) {
            const label = sortedLabels[index];
            const obj = pieData.get(label);

            const value = obj.value;
            const color = obj.color || "";
            //set fillColor
            color? tempCtx.fillStyle = color: null;//set bar color if exists
            if(!isNaN(value)){

                const valDecimal = (value/sumOfValues);
                degrees += (valDecimal*360);

                const endDegrees = degrees;

                const percent = Calc.toFixedIfNeeded(valDecimal*100);

                DrawPieSlice(dv, tempCtx, startDegrees, endDegrees, holeRadius, label, value, percent, tickFormat, color);

                startDegrees = endDegrees;
            }
        }

        //draw hole in pie to create a daughnut chart
        const newRadius = Calc.getArcRadius(graphWidth, graphHeight);
        const arcCenterX = (graphX+(graphWidth/2)), arcCenterY = (graphY+newRadius);

        tempCtx.globalCompositeOperation = "destination-out";
        tempCtx.globalAlpha = 1;
        tempCtx.beginPath();
        tempCtx.arc(arcCenterX, arcCenterY, holeRadius, 0, 2 * Math.PI);
        tempCtx.fill();
        tempCtx.globalCompositeOperation = 'source-over';

        ctx.drawImage(tempCanvas, 0, 0, canvasWidth, canvasHeight);
        
    }else if(type === "table"){

        const tableData = layout.tableData;

        const header = tableData.header;
        const data = tableData.data;

        const columnCount = tableData.columnCount;
        const rowCount = tableData.rowCount;

        let columnWidth = Array.isArray(tableData.columnWidth)? tableData.columnWidth: [];
        const columnWidthDiff = (columnCount - columnWidth.length);

        columnWidth = columnWidth.length <= columnCount? columnWidth.concat(new Array(columnWidthDiff).fill(Math.min(columnWidth) || 1)): columnWidth.slice(0, columnCount);

        const columnWidthSum = Calc.sum(columnWidth);

        const headerFont = header.font? header.font: {};
        const thFontSize = headerFont.fontSize? headerFont.fontSize: fontSize;
        const thRowHeight = (thFontSize+fontSize);

        const dataFont = data.font? data.font: {};
        const tdFontSize = dataFont.fontSize? dataFont.fontSize: fontSize;
        const tdRowHeight = (tdFontSize+fontSize);
        
        const tableWidth = (graphWidth-graphX);
        const providedColumnsWidth = columnWidth.length > 0? ((columnWidth.length/columnCount)*tableWidth): 0;                 
        
        //
        const contentTop = ((((scrollData.topIndex||0)/(rowCount))*scrollData.contentHeight) || 0)
        const tableHeight = ((thRowHeight+(tdRowHeight*(rowCount-1)))-contentTop);


        //set alt column width
        const altColumnWidth = ((tableWidth-providedColumnsWidth)/columnCount);

        const newTopIndex = topIndex, newTopIndexEnd = topIndexEnd < (rowCount-1)? topIndexEnd: (rowCount-1);

        let rowTop = (graphY+thRowHeight)-(((scrollData.topIndex-newTopIndex)/(rowCount-1))*scrollData.contentHeight), rowLeft = graphX;
        const defaultRowTop = rowTop, defaultRowLeft = rowLeft;
        
        //draw Columns 
        let lineWidth = 0;
        let defaultLineWidth = 1;
        const dataValues = data.values;
        for(let i = 0; i < columnCount; i++){
            const columnValues = dataValues[i] || new Array((rowCount-1)).fill("");
            const tdColumnWidth = columnWidth[i]? ((columnWidth[i]/columnWidthSum)*providedColumnsWidth): altColumnWidth;

            for(let index = newTopIndex; index < newTopIndexEnd; index++){
                const cellValue = isNaN(columnValues[index])? columnValues[index] || "": columnValues[index];

                const firstPos = {x: rowLeft, y: (rowTop+tdRowHeight)};
                const secondPos = {x: (rowLeft+tdColumnWidth), y: (rowTop+tdRowHeight)};
                const thirdPos = {x: secondPos.x, y: rowTop};

                const positions = [firstPos, secondPos, thirdPos];
                const rect = {x: firstPos.x, y: rowTop, width: tdColumnWidth, height: tdRowHeight};

                const line = data.line || {};
                lineWidth = isNaN(line.width)? defaultLineWidth: line.width;

                //remove the 'values' property, and the value, center for text position, and adds header properties
                const {values, ...properties } = {
                    value: cellValue,
                    center: {x: (rowLeft+(tdColumnWidth/2)), y: (rowTop+(tdRowHeight/2))},
                    ...data
                };

                rowTop += tdRowHeight;

                if(index === (newTopIndexEnd-1)){
                    rowTop = defaultRowTop;
                    positions.shift();
                }

                if(i === (columnCount-1)){
                    positions.pop();
                }

                DrawCell(dv, tempCtx, positions, properties, rect, i, index, tdColumnWidth);
                
            }

            rowLeft += tdColumnWidth;
        }

        //draw data outer line 
        if(lineWidth){
            tempCtx.beginPath();
            tempCtx.lineWidth = lineWidth;
            tempCtx.moveTo(graphX, (graphY+thRowHeight));
            tempCtx.lineTo(graphX, ((graphY+tableHeight)-lineWidth));
            tempCtx.lineTo(graphWidth, ((graphY+tableHeight)-lineWidth));
            tempCtx.lineTo(graphWidth, (graphY+thRowHeight));
            tempCtx.stroke();
        }

        //clear title and header area
        const halfLineWidth = lineWidth? lineWidth/2: lineWidth;
        tempCtx.clearRect(0, 0, canvas.width, (graphY+(thRowHeight-halfLineWidth)));


        rowTop = graphY, rowLeft = graphX;
        //draw Header 
        lineWidth = 0;
        const headerValues = header.values;
        for(let i = 0; i < columnCount; i++){
            const thColumnWidth = columnWidth[i]? ((columnWidth[i]/columnWidthSum)*providedColumnsWidth): altColumnWidth;
            const value = isNaN(headerValues[i])? headerValues[i] || "": headerValues[i];

            const firstPos = {x: rowLeft, y: (rowTop+thRowHeight)};
            const secondPos = {x: (rowLeft+thColumnWidth), y: (rowTop+thRowHeight)};
            const thirdPos = {x: secondPos.x, y: rowTop};

            const positions = [firstPos, secondPos, thirdPos];
            const rect = {x: firstPos.x, y: graphY, width: thColumnWidth, height: thRowHeight};

            const fill = header.fill || {};
            const line = header.line || {};

            lineWidth = isNaN(line.width)? defaultLineWidth: line.width;
            //remove the 'values' property, and the value, center for text position, and adds header properties
            const {values, ...properties } = {
                value: value, 
                center: {x: (rowLeft+(thColumnWidth/2)), y: (rowTop+(thRowHeight/2))},
                fontSize: thFontSize,
                fill: {color: fill.color? fill.color: "white", ...fill},
                ...header
            };

            rowLeft += thColumnWidth;

            if(i === (columnCount-1)){
                positions.pop();
            }

            DrawCell(dv, tempCtx, positions, properties, rect, i, 0, thColumnWidth);
        }

        //draw header outer line 
        if(lineWidth){
            tempCtx.beginPath();
            tempCtx.lineWidth = lineWidth;
            tempCtx.moveTo(graphX, (graphY+thRowHeight));
            tempCtx.lineTo(graphX, (graphY));
            tempCtx.lineTo(graphWidth, (graphY));
            tempCtx.lineTo(graphWidth, (graphY+thRowHeight));
            tempCtx.stroke();
        }

        ctx.drawImage(tempCanvas, 0, 0, canvasWidth, canvasHeight);
    
    }
}

export default DrawElements