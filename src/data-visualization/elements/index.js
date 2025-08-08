import * as Calc from '../helpers/math.js'
import * as Global from '../helpers/global.js';

//import elements
import * as Bars from './bars.js';
import DrawLines from './lines.js';
import DrawPoints from "./points";
import DrawPieSlice from './pie.js';
import DrawCell from './cell.js';
import fillArea from './area.js';
import DrawKPI from './kpi.js';

const DrawElements = (dv, dataset) => {

    const layout = dv.getLayout();

    const ctx = dv.getCtx();

    const canvas = dv.getCanvas();

    const canvasSize = dv.getCanvasSize();
    const canvasWidth = canvasSize.width, canvasHeight = canvasSize.height;


    const tempCanvas = dv.createCanvas(null, canvasWidth, canvasHeight);
    const tempCtx = tempCanvas.getContext("2d");

    const areaCanvas = dv.createCanvas(null, canvasWidth, canvasHeight);
    const areaCtx = areaCanvas.getContext("2d");

    const design = dv.getDesign();
    const font = design.font;

    const fontSize = font.size;

    const type = dataset.type;
    const mode = dataset.mode;
    const isHorizontal = dataset.direction === "hr";

    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    const axisData = layout.axisData;
    const scrollData = dv.getScrollData();

    const layoutSize = layout.size || {};
    const sizeRange = layoutSize.range;
    
    //const scrollIndex = isHorizontal? scrollData.topIndex: scrollData.leftIndex;

    const topIndex = Math.floor(scrollData.topIndex >= 1? (scrollData.topIndex-1): 0), leftIndex = Math.floor(scrollData.leftIndex >= 1? (scrollData.leftIndex-1): 0);
    const topIndexEnd = Math.ceil((topIndex + 2) + (graphHeight/fontSize));

    //set line cap and join
    tempCtx.lineCap = "round";
    tempCtx.lineJoin = "round";

    if(type === "axis"){
        const leftIndexEnd = Math.ceil((leftIndex + 2) + (graphWidth/fontSize));
        const topIndexDiff = Math.abs(topIndexEnd-topIndex), leftIndexDiff = Math.abs(leftIndexEnd-leftIndex);

        const isLoopLeftAxis = (scrollData.isScrollX || !axisData.xData["x1"].isNumeric) && ((leftIndexDiff > topIndexDiff) || axisData.yData["y1"].isNumeric);

        const scrollIndex = isLoopLeftAxis? leftIndex: topIndex;
        const scrollIndexEnd = isLoopLeftAxis? leftIndexEnd: topIndexEnd;

        const dataGroup = dataset;
        const axisDatasets = dataGroup.dataset;
        const datasetLength = axisDatasets.length;

        const maxBarPerLabel = dataGroup.barDatasetCount;

        const graphLength = isHorizontal? graphHeight: graphWidth;

        const stackLastValues = new Map();
        const barStackLastValues = new Map();

        const isStacked = mode === "stack";
        const stackSums = dataGroup.stackSums || new Map();
        const isPercent = dataGroup.format === "percent";

        let barDatasetIndex = 0;
        
        for(let i = 0; i < axisDatasets.length; i++){

            const dataset = axisDatasets[i];
            const chartType = dataset.type;

            const customData = dataset.custom || {};

            const isHistogram = chartType === "histogram";

            if(chartType === "bar" || isHistogram){
                const barData = dataset;
                //set barData direction 
                barData.direction = dataGroup.direction;

                const yAxis = axisData.yData[barData.yAxis];
                const xAxis = axisData.xData[barData.xAxis];

                const baseAxis = isHorizontal? yAxis: xAxis;

                const xAxisIsAllNumbers = xAxis.isNumeric, yAxisIsAllNumbers = yAxis.isNumeric;

                const xAxisIsLabel = (!xAxisIsAllNumbers || yAxisIsAllNumbers);

                const tickFormat = {label: xAxis.tickFormat, value: yAxis.tickFormat};

                const labelCount = baseAxis.values.length;

                let step = (graphLength/labelCount);
                step < fontSize? step = fontSize: null;

                let barSize = isStacked? step: (step/(maxBarPerLabel));

                //set the bar size given how far apart each bar is from each other (eliminating overlapping bars)
                if(baseAxis.isNumeric){
                    const range = baseAxis.range;
                    const rangeStart = range[0], rangeEnd = range[1];

                    const rangeLength = (rangeEnd-rangeStart);

                    const datasetBarSize = dataGroup.barSize;

                    const newBarSize = datasetBarSize? ((datasetBarSize/rangeLength)*graphLength): null;

                    barSize = newBarSize? isStacked? newBarSize: (newBarSize/maxBarPerLabel): barSize;
                }

                const designSize = barData.design.size;
                const designColor = barData.design.color;

                tempCtx.fillStyle = designColor;

                const range = isHorizontal? xAxis.range: yAxis.range;
                const rangeStart = Calc.getNumberInRange(0, range);

            
                const barObject = barData.dataPoints;
                const barCustomData = barData.custom;
                //const barValues = Array.from(barObject.values());
                const keys = Array.from(barObject.keys());

                const labels =  (isHistogram? keys: baseAxis.values) || [];

                //const keys = Array.from(barObject.keys());

                //const loopEnd = baseAxis.isNumeric?  barObject.size: scrollIndexEnd <  barObject.size? scrollIndexEnd:  barObject.size;
                const loopEnd = baseAxis.isNumeric? barObject.size: (scrollIndexEnd <  barObject.size)? scrollIndexEnd:  barObject.size;

                for(let index = scrollIndex; index < loopEnd; index++){

                    const key = labels[index];
                    let value = barObject.get(key);

                    const size = Array.isArray(designSize)? designSize[(index>=designSize.length? 0: index)]: designSize;
                    const newBarSize = barSize * (size || 0.8);
                    
                    Array.isArray(value)? value = value[0]: null;
                    Array.isArray(designColor)? tempCtx.fillStyle = designColor[(index>=designColor.length? 0: index)]: null;
                    
                    if(isHistogram){
                        Bars.Histogram(dv, tempCtx, barData, i, key, value, (barSize * 0.96), tickFormat);
                    }else {
                        if(isStacked){
                            const keyRange = stackSums.get(key) || {};

                            // Determine the base max value for percent formatting
                            const maxValue = Math.abs((value < 0? keyRange.min: keyRange.max) || value);

                            let stackValue = isPercent ? (value / maxValue) * 100 : value;

                            const [lastPos, lastNeg] = barStackLastValues.get(key) || [0, 0];

                            // Determine the base position in the stack depending on the sign
                            const baseStack = value >= 0 ? lastPos : lastNeg;

                            // Calculate the current cumulative stack value
                            const cumulativeValue = barDatasetIndex === 0 ? stackValue : baseStack + stackValue;

                            const updatedStack = value >= 0 
                            ? [cumulativeValue, lastNeg]
                            : [lastPos, baseStack + value];

                            // Save the updated stack state for this key
                            barStackLastValues.set(key, updatedStack);

                            Bars.Stack(dv, tempCtx, isPercent, barData, newBarSize, key, xAxisIsLabel, baseStack, cumulativeValue, stackValue, value, barCustomData, tickFormat);
                        }else {
                            Bars.Group(dv, tempCtx, barData, barDatasetIndex, key, xAxisIsLabel, value, newBarSize, maxBarPerLabel, barCustomData, tickFormat);
                        }
                    }

                }
                barDatasetIndex++;
            }else {
                const valueAxisName = dataset.yAxis? dataset.yAxis: "y1";
                const labelAxisName = dataset.xAxis? dataset.xAxis: "x1";
    
                const xAxis = axisData.xData[labelAxisName];
                const yAxis = axisData.yData[valueAxisName];
    
                const labelTitle = layout["xAxis"]? layout["xAxis"].title: null;
    
                const datasetName = dataset.name || "";
                
                const datasetDesign = dataset.design || {};

                const designColor = datasetDesign.color;

                const designSize = datasetDesign.size;
                const designSizeData = designSize?.data || {};

                const defaultSize = 3;
    
                const xAxisIsAllNumbers = xAxis.isNumeric;
                const yAxisIsAllNumbers = yAxis.isNumeric;

                const xAxisIsLabel = (!xAxisIsAllNumbers || yAxisIsAllNumbers);
    
                //set xValues to categoryMidPoints if it is a barChart, to be used for mixed charts
                //const labels = isHorizontal? dataset.values: dataset.labels;
                const dataPoints = dataset.dataPoints;

                let labels = xAxisIsLabel? xAxis.values: yAxis.values;

                const labelIsAllNumbers = xAxisIsLabel? xAxisIsAllNumbers: yAxisIsAllNumbers;
                
                const isSingleLinePoint = (chartType === "line" && dataPoints.size === 1);

                //const values = isHorizontal? dataset.labels: dataset.values? dataset.values: [];
                if(labels){
                    
                    let isDrawStarted = false;
                    let lastPosition = {x: null, y: null}, positionType;
                    let valueIsNull = false;
                    let strokeEnd = true;

                    let hasAreaStartIndex = false;
                    let areaStartIndex = 0;
    
                    //const loopStart = (Math.floor(scrollIndex) - (Math.floor(scrollIndex) > 0? 1: 0));
    
                    const loopStart = (scrollIndex);
                    const loopEnd = labelIsAllNumbers? labels.length: scrollIndexEnd < labels.length? scrollIndexEnd: labels.length;
                    
                    for(var index = loopStart; index < loopEnd; index++){
                        
                        const tempLabel = labels[index];
                        const tempValue = dataPoints.get(tempLabel);

                        let value = yAxisIsAllNumbers? tempValue: tempLabel;
                        let label = yAxisIsAllNumbers? tempLabel: tempValue;
    
                        const prevI = (index-1);
                        let prevLabel = Global.defaultIfNull(labels[prevI], tempLabel);
                        let prevValue = Global.defaultIfNull(dataPoints.get(prevLabel), value);
    
                        const nextI = (index+1);
                        let nextLabel = Global.defaultIfNull(labels[nextI], tempLabel);
                        let nextValue = Global.defaultIfNull(dataPoints.get(nextLabel), value);
    
                        const color = Array.isArray(designColor)? designColor[index]? designColor[index]: designColor[0]: designColor;
                        const sizeName = (designSize || {}).name ?? "";

                        //tempCtx.fillStyle = color;
                        //tempCtx.strokeStyle = color;
                        
                        if(value || value === 0){ //proceed if y is valid
                            if(!hasAreaStartIndex){
                                areaStartIndex = index;
                                hasAreaStartIndex = true;
                            }

                            let stackValue = 0; 

                            let prevCumulativeValue = prevValue;
                            let cumulativeValue = value;
                            let nextCumulativeValue = nextValue;

                            if(isStacked && chartType === "area"){

                                //const keyMinMax = stackSums.get(label) || {};
                                //const nextKeyMinMax = stackSums.get(nextLabel) || {};

                                const range = stackSums.get(label) || 0;//(keyMinMax.max - keyMinMax.min);
                                const nextRange = stackSums.get(nextLabel) || 0;//(nextKeyMinMax.max - nextKeyMinMax.min);

                                const lastValue = stackLastValues.get(label) || 0;

                                // Convert to percent if isPercent
                                stackValue = isPercent ? ((value / range) * 100) || 0 : value;
                                const nextStackValue = isPercent ? ((nextValue / nextRange) * 100) || 0 : nextValue;

                                cumulativeValue = i === 0 ? stackValue : lastValue + stackValue;

                                prevCumulativeValue = stackLastValues.get(prevLabel) || cumulativeValue;
                                nextCumulativeValue = stackLastValues.get(nextLabel) || nextStackValue;

                                stackLastValues.set(label, cumulativeValue);
                            }
                            
                            const prevPosition = Calc.getAxisPosition(dv, prevLabel, prevCumulativeValue, valueAxisName, labelAxisName);
                            const position = Calc.getAxisPosition(dv, label, cumulativeValue, valueAxisName, labelAxisName);
                            const nextPosition = Calc.getAxisPosition(dv, nextLabel, nextCumulativeValue, valueAxisName, labelAxisName);
                            
                            let positionIsOut = false;

                            let bubbleSize = defaultSize;
                            let radius = defaultSize;
    
                            if((chartType === "line" || chartType === "area") && !isSingleLinePoint){

                                const size = (Array.isArray(designSize)? designSize[index]: designSize) || defaultSize;

                                if(index === loopStart){
                                    positionType = "start";
                                    strokeEnd = false;
                                }else if(index === (loopEnd-1)){
                                    !valueIsNull? positionType = "end": null;
                                }else {
                                    !valueIsNull? positionType = "": null;
                                    valueIsNull = false;
                                }
    
                                //const boundPosition = Calc.findAxisBoundPositions(dv, i, labels, values, valueAxisName, labelAxisName, lastPosition, isDrawStarted, loopStart, loopEnd);

                                const allPositionsIsOut = Calc.posIsOutOfBound(dv, prevPosition) && Calc.posIsOutOfBound(dv, position) && Calc.posIsOutOfBound(dv, nextPosition);
                                const isCurrentPositionOut = Calc.posIsOutOfBound(dv, position);

                                //const isBreakLine = (allPositionsIsOut && positionType === "start") || (isCurrentPositionOut && (position.x === lastPosition.x || position.y === lastPosition.y));
                                const isBreakLine = (position.x === lastPosition.x && position.y === lastPosition.y);

                                //!isDrawStarted? positionType = "start": null;
                                positionIsOut = Calc.posIsOutOfBound(dv, position);
                                isDrawStarted = true;

                                //draw area
                                if(chartType === "area"){
                                    if(positionType === "start"){
                                        areaCtx.beginPath();
                                        areaCtx.moveTo(position.x, position.y);
                                    }else {
                                        areaCtx.lineTo(position.x, position.y);
                                    }
                                }

                                DrawLines(dv, tempCtx, dataset, positionType, color, size, position, positionIsOut);
                                
                                //if(chartType === "area" && (positionType === "end" || isBreakLine)){
                                if(chartType === "area" && (positionType === "end" || isBreakLine)){
                                    fillArea(
                                        dv, areaCtx, isStacked, isPercent, i, 
                                        label, labels, [labelAxisName, valueAxisName], stackLastValues,
                                        color, [areaStartIndex, loopEnd], dataPoints, stackSums
                                    );
                                }


                                if((position.x === lastPosition.x && position.y === lastPosition.y)){
                                    tempCtx.stroke();
                                    strokeEnd = true;
                                    break;
                                }

                                lastPosition = position;
    
                            }else if(chartType === "scatter" || isSingleLinePoint){
                                bubbleSize = designSizeData instanceof Map 
                                            ? designSizeData.get(tempLabel) 
                                            : designSize ?? defaultSize;

                                const minSize = sizeRange?.min ?? bubbleSize;
                                const maxSize = sizeRange?.max ?? bubbleSize;

                                const rangeIsNegative = minSize < 0 || maxSize < 0;

                                const maxRadius = Math.min(graphWidth, graphHeight) * 0.1;
                                const minRadius = (rangeIsNegative? 3: maxRadius * (0.2));

                                const effectiveBubbleSize = Math.max(0, bubbleSize);
                                
                                if (maxSize !== minSize) {
                                    // Linear interpolation between minRadius and maxRadius
                                    const radiusRange = maxRadius - minRadius;
                                    //const sizeProportion = (bubbleSize / maxSize);
                                    //radius = minRadius + (radiusRange * sizeProportion);
                                    const sizeProportion = (effectiveBubbleSize / maxSize);
                                    radius = minRadius + (maxRadius - minRadius) * sizeProportion;
                                } else {
                                    radius = minRadius; // Default to minRadius when sizes are equal
                                }

                                positionIsOut = Calc.posIsOutOfRange(dv, label, cumulativeValue, labelAxisName, valueAxisName) || Calc.posIsOutOfBound(dv, position);
                                
                                if(!positionIsOut){
    
                                    const designLine = dataset.design.line;
                                    const lineColor = designLine? designLine.color? designLine.color: color: color;
                                    const lineSize = designLine? designLine.size? designLine.size: 0: 0;
                                    
                                    //set line color and size
                                    tempCtx.fillStyle = color;
                                    tempCtx.strokeStyle = lineColor;
                                    tempCtx.lineWidth = lineSize;
    
                                    
                                    DrawPoints(dv, tempCtx, radius, position);
                                    strokeEnd = true;
                                }
                            }

                            const designSizeLength = (designSizeData?.size || 0);
    
                            
                            //set tooltip
                            const customDataPoints = dataset.customDataPoints;
                            const customDataValues = customDataPoints.get(label) || [];

                            const tickFormat = {label: xAxis.tickFormat, value: yAxis.tickFormat};
                            
                            if(!positionIsOut){
                                dv.setToolTipData({
                                    type: chartType,
                                    point: { radius, midPoint: position },
                                    text: [
                                        { name: labelTitle, value: label, isLabel: xAxisIsLabel },
                                        { name: datasetName, value: value, percent: isPercent && stackValue },
                                        ...(designSizeLength > 1 ? [{ name: sizeName, value: bubbleSize }] : []),  // Conditionally add for "bubble"
                                        ...customDataValues.map((value, index) => {
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
                            hasAreaStartIndex = false;
                            //draw what lines drawn
                            tempCtx.stroke();
                            if(chartType === "area" && (prevValue || prevValue === 0)){
                                fillArea(
                                    dv, areaCtx, isStacked, isPercent, i, 
                                    prevLabel, labels, [labelAxisName, valueAxisName], stackLastValues,
                                    color, [areaStartIndex, index], dataPoints, stackSums
                                );
                            }
                            positionType = "start";
                            valueIsNull = true;
                            continue;
                        }


                    }
    
                }
            }
        }

        tempCtx.clearRect(0, 0, canvasWidth, (graphY-(fontSize*0.5))); //clear top
        tempCtx.clearRect(0, 0, graphX, canvasHeight); //clear left
        tempCtx.clearRect((graphX+graphWidth), 0, canvasWidth, canvasHeight); //clear right
        tempCtx.clearRect(0, (graphY+graphHeight+(fontSize*0.5)), canvasWidth, canvasHeight); //clear bottom

        areaCtx.clearRect(0, 0, canvasWidth, (graphY-(fontSize*0.5))); //clear top
        areaCtx.clearRect(0, 0, graphX, canvasHeight); //clear left
        areaCtx.clearRect((graphX+graphWidth), 0, canvasWidth, canvasHeight); //clear right
        areaCtx.clearRect(0, (graphY+graphHeight+(fontSize*0.5)), canvasWidth, canvasHeight); //clear bottom

        //draw areaCanvas on ctx
        ctx.drawImage(areaCanvas, 0, 0, canvasWidth, canvasHeight);
        
        ctx.drawImage(tempCanvas, 0, 0, canvasWidth, canvasHeight);

    }else if(type === "pie"){
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

                DrawPieSlice(dv, tempCtx, dataset, startDegrees, endDegrees, holeRadius, label, value, percent, color, font);

                startDegrees = endDegrees;
            }
        }

        //draw hole in pie to create a daughnut chart
        const arcCenterX = (graphWidth/2), arcCenterY = (graphHeight/2);

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
        const isSummaryColumns = data.isSummaryColumns || [];

        const maxWidths = tableData.maxWidths || [];
        const cumulativeWidths = tableData.cumulativeWidths || [];

        const totals = tableData.totals || {};
        const isColumnTotal = totals.enableColumnTotal;
        const isRowTotal = totals.enableRowTotal;

        const columnCount = tableData.columnCount;
        const rowCount = tableData.rowCount;

        const stickyColumns = tableData.stickyColumns || {};
        const stickyCount = Math.min((stickyColumns.count || 0), columnCount);

        const headerFont = header.font? header.font: {};
        const thFontSize = headerFont.fontSize? headerFont.fontSize: fontSize;
        const thRowHeight = (thFontSize+fontSize);

        const dataFont = data.font? data.font: {};
        const tdFontSize = dataFont.fontSize? dataFont.fontSize: fontSize;
        const tdRowHeight = (tdFontSize+fontSize);

        const maxRowWidth = tableData.rowsValueSum;
        const avgColumnWidth = ((maxRowWidth/columnCount));

        const totalsFont = totals.font || {};
        const totalsFontSize = totalsFont.fontSize || fontSize;
        
        //const contentLeft = ((((scrollData.leftIndex||0)/(columnCount))*scrollData.contentWidth) || 0);
        //const contentLeft = scrollData.leftIndex >= 1? (cumulativeWidths.slice(stickyCount)[Math.floor(scrollData.leftIndex)] || 0): 0;
        const contentTop = ((((scrollData.topIndex||0)/(rowCount))*scrollData.contentHeight) || 0);

        //const providedColumnsWidth = columnWidth.length > 0? ((columnWidth.length/columnCount)*tableWidth): 0;                 
        
        //
        const tableHeight = ((thRowHeight+(tdRowHeight*(rowCount-1)))-contentTop);

        const viewLastColumnIndex = Calc.scrolledColumnIndex((scrollData.x + graphWidth), cumulativeWidths);

        const leftIndexEnd = (viewLastColumnIndex + 2)//Math.ceil((leftIndex + 2) + viewLastColumnIndex);
        let newLeftIndex = Math.floor(scrollData.leftIndex >= 1? scrollData.leftIndex: 0), newLeftIndexEnd = leftIndexEnd < columnCount? leftIndexEnd: columnCount;
        const leftIndexDiff = (scrollData.leftIndex-newLeftIndex);

        let newTopIndex = topIndex, newTopIndexEnd = topIndexEnd < (rowCount-1)? topIndexEnd: (rowCount-1);
        isColumnTotal? newTopIndexEnd = newTopIndexEnd - 1: null;

        let rowTop = (thRowHeight)-(((scrollData.topIndex-newTopIndex)/(rowCount))*scrollData.contentHeight);
        const defaultRowTop = rowTop;

        //const stickyRowSum = maxWidths.slice(0, stickyCount)?.reduce((acc, val) => acc + val, 0);
        const stickyWidth = cumulativeWidths[stickyCount-1] || 0;

        const leftIndexCeilDiff = (Math.floor(leftIndexDiff)+1)-leftIndexDiff;

        //const offsetColIndex = Math.floor(scrollData.leftIndex-newLeftIndex);
        const offsetColIndex = Math.floor(scrollData.leftIndex);
        const stickyOffset = cumulativeWidths.slice(stickyCount)[newLeftIndex];
        const lastOffsetColumnWidth = maxWidths.slice(stickyCount)[offsetColIndex];

        //const stickyRowLeft = ((graphX + (stickyWidth))-(((scrollData.leftIndex-newLeftIndex)/(columnCount))*scrollData.contentWidth));
        const stickyRowLeft = ((graphX + (stickyWidth))-((stickyOffset-stickyWidth)-(leftIndexCeilDiff*lastOffsetColumnWidth)));

        const tableWidth = (maxRowWidth) - ((stickyOffset-stickyWidth)-(leftIndexCeilDiff*lastOffsetColumnWidth));

        //const stickyWidth = (stickyRowWidth * stickyCount);

        const defaultRowLeft = ((graphX)-((stickyOffset-stickyWidth)-(leftIndexCeilDiff*lastOffsetColumnWidth)));
        let rowLeft = stickyRowLeft;

        //draw Columns 
        let defaultLineWidth = 1;
        let lineWidth = 0;
        const dataValues = data.values;

        const columnsTotal = totals.columns;
        const rowsTotal = totals.rows;

        function drawHeader(start, end, keepEndPosition){

            //const prevCumWidth = (cumulativeWidths[(start-1)|| 0]) - stickyWidth;
            //const maxWidth = maxWidths[i];
            //rowLeft += (start !== (stickyCount-1)? prevCumWidth: 0)

            const headerValues = header.values;
            for(let i = start; i < end; i++){
                const prevCumWidth = (cumulativeWidths[i-1] || 0) - stickyWidth;
                const maxWidth = maxWidths[i];
                const tdColumnWidth = (i === start && i !== (stickyCount-1)? prevCumWidth: 0) + maxWidth;
                //const tdColumnWidth = maxWidths[i];
                //const thColumnWidth = columnWidth[i]? ((columnWidth[i]/columnWidthSum)*providedColumnsWidth): altColumnWidth;
                let value = isNaN(headerValues[i])? headerValues[i] || "": headerValues[i];

                const firstPos = {x: rowLeft, y: (thRowHeight)};
                const secondPos = {x: (rowLeft+tdColumnWidth), y: (rowTop+thRowHeight)};
                const thirdPos = {x: secondPos.x, y: rowTop};

                const positions = [firstPos, secondPos, thirdPos];
                const rect = {x: firstPos.x, y: rowTop, width: tdColumnWidth, height: thRowHeight};

                const fill = header.fill || {};

                const font = {...header.font};

                if(isRowTotal){
                    if(i === (columnCount-1)){
                        value = "Total";
                        font.style = "bold";
                    } 
                }

                //remove the 'values' property, and the value, center for text position, and adds header properties
                const {values, ...properties } = {
                    ...header,
                    value: value, 
                    center: {x: ((rowLeft+tdColumnWidth)-(maxWidth/2)), y: ((thRowHeight/2))},
                    fontSize: thFontSize,
                    fill: {color: fill.color? fill.color: "white", ...fill},
                    font
                };

                rowLeft += tdColumnWidth;

                if(i === (end-1) && !keepEndPosition){
                    rowLeft = defaultRowLeft;
                    positions.pop();
                }

                DrawCell(tempCtx, positions, properties, rect, i, 0, tdColumnWidth);
            }
        }

        function drawBody(start, end){

            for(let i = start; i < end; i++){
                const prevCumWidth = (cumulativeWidths[i-1] || 0) - stickyWidth;
                const maxWidth = maxWidths[i];
                const tdColumnWidth = (i === start && i !== (stickyCount-1)? prevCumWidth: 0) + maxWidth;
                //const tdColumnWidth = maxWidths[i];
                const columnValues = dataValues[i] || new Array((rowCount-1)).fill("");
                const isNumeric = (data.isNumericColumns||[])[i] || false;
                const format = Array.isArray(data.format)? data.format[i]: data.format || {};
                const range = data.columnRanges? data.columnRanges[i]: [null, null];
                //const tdColumnWidth = columnWidth[i]? ((columnWidth[i]/columnWidthSum)*providedColumnsWidth): altColumnWidth;
    
                for(let index = newTopIndex; index < newTopIndexEnd; index++){
                    let cellValue = isNaN(columnValues[index])? columnValues[index] || "": columnValues[index];
    
                    const firstPos = {x: rowLeft, y: (rowTop+tdRowHeight)};
                    const secondPos = {x: (rowLeft+tdColumnWidth), y: (rowTop+tdRowHeight)};
                    const thirdPos = {x: secondPos.x, y: rowTop};
    
                    const positions = [firstPos, secondPos, thirdPos];
                    const rect = {x: firstPos.x, y: rowTop, width: tdColumnWidth, height: tdRowHeight};

                    const line = data.line || {};
                    lineWidth = isNaN(line.width)? defaultLineWidth: line.width;
    
                    const font = {...data.font};
    
                    if(isRowTotal){
                        if(i === (columnCount-1)){
                            cellValue = rowsTotal[index];
                            font.style = "bold";
                            positions.pop();
                        }
                    }
    
                    //remove the 'values' property, and the value, center for text position, and adds header properties
                    const {values, ...properties } = {
                        ...data,
                        value: cellValue,
                        center: {x: ((rowLeft+tdColumnWidth)-(maxWidth/2)), y: (rowTop+(tdRowHeight/2))},
                        font,
                        isNumeric,
                        format,
                        range,
                    };
    
                    rowTop += tdRowHeight;
    
                    if(index === (newTopIndexEnd-1)){
                        rowTop = defaultRowTop;
    
                        positions.shift();
                    }
    
                    DrawCell(tempCtx, positions, properties, rect, i, index, tdColumnWidth);
                    
                }
    
                rowLeft += tdColumnWidth;
            }

            rowLeft = defaultRowLeft;
        }

        function drawColumnTotal(start, end){
            const operations = data.operation || [];

            for(let i = start; i < end; i++){
                const prevCumWidth = (cumulativeWidths[i-1] || 0) - stickyWidth;
                const maxWidth = maxWidths[i];
                const tdColumnWidth = (i === start && i !== (stickyCount-1)? prevCumWidth: 0) + maxWidth;
                
                let value = columnsTotal[i];
                const operation = operations[i] || null;
                const isOperation = operation && operation !== "none";

                const isNumeric = (data.isNumericColumns||[])[i] || false;
                const format = Array.isArray(data.format)? data.format[i]: data.format || {};
                
                const firstPos = {x: rowLeft, y: (rowTop)};
                const secondPos = {x: (rowLeft+tdColumnWidth), y: (rowTop)};
                const thirdPos = {x: secondPos.x, y: (rowTop+tdRowHeight)};

                const positions = [firstPos, secondPos];
                const rect = {x: firstPos.x, y: rowTop, width: tdColumnWidth, height: tdRowHeight};

                if(i === (columnCount-1) && isRowTotal){
                    value = totals.grand;
                }else {
                    if(!isOperation){
                        value = "";
                        if(i === 0){
                            value = "Total";
                        }
                    }
                }

                const {values, ...properties } = {
                    value,
                    center: {x: ((rowLeft+tdColumnWidth)-(maxWidth/2)), y: (rowTop+(tdRowHeight/2))},
                    line: {...(data.line || {})},
                    font: {
                        ...(data.font || {}),
                        style: "bold",
                    },
                    isNumeric,
                    format,
                    ...totals,
                };

                rowLeft += tdColumnWidth;

                DrawCell(tempCtx, positions, properties, rect, i, (rowCount-1), tdColumnWidth);
            }

            rowLeft = defaultRowLeft;
        }

        //draw columns body
        drawBody((newLeftIndex + stickyCount), newLeftIndexEnd);
        
        if(stickyCount){
            tempCtx.clearRect(graphX, 0, stickyWidth, canvas.height);
            rowLeft = graphX;
            drawBody(0, stickyCount);
        }


        //clear header area
        const halfLineWidth = lineWidth? lineWidth/2: lineWidth;
        tempCtx.clearRect(0, 0, canvas.width, ((thRowHeight-halfLineWidth)));

        const line = header.line || {};
        lineWidth = isNaN(line.width)? 1: line.width;

        if(isColumnTotal){

            const totalRowTop = (Math.min(graphHeight, tableHeight)-tdRowHeight);
            rowTop = totalRowTop;
            rowLeft = stickyRowLeft;
            
            //clear column total area
            tempCtx.clearRect(halfLineWidth, rowTop, (canvas.width-halfLineWidth), ((tdRowHeight)));
            
            drawColumnTotal((newLeftIndex + stickyCount), newLeftIndexEnd);

            if(stickyCount){
                tempCtx.clearRect(graphX, totalRowTop, stickyWidth, tdRowHeight);
                rowLeft = graphX;
                drawColumnTotal(0, stickyCount);
            }
        }

        //draw data outer line 
        if(columnCount){
            tempCtx.beginPath();
            tempCtx.lineWidth = lineWidth;
            tempCtx.moveTo(graphX, (thRowHeight));
            if(isColumnTotal){
                tempCtx.lineTo(graphX, (Math.min(graphHeight, tableHeight)-tdRowHeight));
                tempCtx.stroke();

                tempCtx.beginPath();
                tempCtx.moveTo(tableWidth, (thRowHeight));
                tempCtx.lineTo(tableWidth, (Math.min(graphHeight, tableHeight)-tdRowHeight));
            }else {
                tempCtx.lineTo(graphX, ((tableHeight)-lineWidth));
                tempCtx.lineTo(tableWidth, ((tableHeight)-lineWidth));
                tempCtx.lineTo(tableWidth, (thRowHeight));
            }
            tempCtx.stroke();
        }

        rowTop = (lineWidth/2);
        rowLeft = stickyRowLeft;
        //draw Header 
        drawHeader((newLeftIndex + stickyCount), newLeftIndexEnd);

        if(stickyCount){  
            rowLeft = graphX;
            rowTop = (lineWidth/2);

            tempCtx.clearRect(rowLeft, rowTop, stickyWidth, thRowHeight);
            drawHeader(0, stickyCount, true);
        }

        //draw header outer line 
        if(columnCount){
            tempCtx.beginPath();
            tempCtx.lineWidth = lineWidth;
            tempCtx.moveTo(graphX, (thRowHeight));
            tempCtx.lineTo(graphX, 0);
            tempCtx.lineTo(tableWidth, 0);
            tempCtx.lineTo(tableWidth, (thRowHeight));
            tempCtx.stroke();
        }

        //draw sticky line 
        if(stickyCount){

            const lineColor = "green";
            //vertical
            tempCtx.beginPath();
            tempCtx.lineWidth = lineWidth;
            tempCtx.strokeStyle = lineColor;
            tempCtx.moveTo((graphX+stickyWidth), thRowHeight);
            tempCtx.lineTo((graphX+stickyWidth), tableHeight);
            tempCtx.stroke();

            //horizontal
            tempCtx.beginPath();
            tempCtx.lineWidth = lineWidth;
            tempCtx.strokeStyle = lineColor;
            tempCtx.moveTo(graphX, thRowHeight);
            tempCtx.lineTo(tableWidth, thRowHeight);
            tempCtx.stroke();
            
        }

        ctx.drawImage(tempCanvas, 0, 0, canvasWidth, canvasHeight);
    
    }else if(type === "kpi"){
        const valueDataset = dataset.valueDataset || {};
        const targetDataset = dataset.targetDataset || {};
        const trendDataset = dataset.trendDataset || {};

        DrawKPI(tempCtx, valueDataset, targetDataset, trendDataset, canvasWidth, canvasHeight);

        //console.log(ctx.canvas.width, canvasWidth, ctx.canvas.height, canvasHeight);

        ctx.drawImage(tempCanvas, 0, 0, canvasWidth, canvasHeight);
    }
}

export default DrawElements;