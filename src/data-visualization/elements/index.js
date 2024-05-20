import * as Calc from '../helpers/math.js'

//import elements
import * as Bars from './bars.js';
import DrawLines from './lines.js';
import DrawPoints from "./points";
import DrawPieSlice from './pie.js';

import customColors from '../helpers/colors.js';

const DrawElements = (dv, dataset) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const labelStyle = dv.getStyle().label;
    const fontSize = labelStyle.fontSize;

    const type = dataset.type;
    const mode = dataset.mode;


    if(type === "bar"){

        const axisData = layout.axisData;

        const barDataset = dataset.dataset;

        const isHorizontal = dataset.direction === "hr";

        const maxBarPerLabel = barDataset.length;

        const graphPosition = layout.graphPosition;
        const graphLength = isHorizontal? graphPosition.height: graphPosition.width;

        const stackLastValues = new Map();
        
        for(let i = 0; i < barDataset.length; i++){

            const barData = barDataset[i];
            //set barData direction 
            barData.direction = dataset.direction;

            const yAxis = axisData.values[barData.yAxis];
            const xAxis = axisData.labels[barData.xAxis];

            const tickFormat = {label: xAxis.tickFormat, value: yAxis.tickFormat};

            const labelCount = xAxis.values.length;

            let step = (graphLength/labelCount);
            step < fontSize? step = fontSize: null;

            let barSize = mode === "stack"? (step*0.7): (step/(maxBarPerLabel+1));

            //set the bar size given how far apart each bar is from each other (eliminating overlapping bars)
            const baseAxis = isHorizontal? yAxis: xAxis;
            
            if(baseAxis.isAllNumbers){
                const range = baseAxis.range;
                const rangeStart = range[0], rangeEnd = range[1];

                const rangeLength = (rangeEnd-rangeStart);

                const newBarSize = dataset.barSize;

                newBarSize? barSize = (newBarSize/rangeLength)*graphLength: null;
            }

            const designColor = barData.design.color;

            ctx.fillStyle = designColor;

            let index = 0;

            const range = isHorizontal? xAxis.range: yAxis.range;
            const rangeStart = Calc.getNumberInRange(0, range);

            barData.values.forEach((value, key) => {
                Array.isArray(value)? value = value[0]: null;
                Array.isArray(designColor)? ctx.fillStyle = designColor[(index>=designColor.length? 0: index)]: null;
                
                if(mode === "stack"){

                    const lastStack = stackLastValues.has(key)? stackLastValues.get(key): [rangeStart, rangeStart];
                    const lastValue = value >= 0? (lastStack[0]): (lastStack[1]);
                    
                    const currentValue = value;
                    value = i === 0? value: (lastValue+value);

                    const currentStack = value >= 0? [value, lastStack[1]]: [lastStack[0], currentValue];
                    stackLastValues.set(key, currentStack);

                    Bars.Stack(dv, barData, barSize, key, lastValue, value, currentValue, tickFormat);
                }else {
                    Bars.Group(dv, barData, i, key, value, barSize, maxBarPerLabel, tickFormat);
                }

                index++;
            });
        }
        

    }else if(type === "pie"){

        const axisData = layout.axisData;
        const valueAxisName = dataset.yAxis? dataset.yAxis: "y1";
        const labelAxisName = dataset.xAxis? dataset.xAxis: "x1";

        const yAxis = axisData.values[valueAxisName];
        const xAxis = axisData.labels[labelAxisName];

        const tickFormat = {label: xAxis.tickFormat, value: yAxis.tickFormat};

        const tempCanvas = dv.getTempCanvas();
        tempCanvas.width = ctx.canvas.width;
        tempCanvas.height = ctx.canvas.height;

        const tempCtx = tempCanvas.getContext("2d");

        const graphPosition = layout.graphPosition;
        const graphX = graphPosition.x, graphY = graphPosition.y;
        const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

        const radius = (Math.min(graphWidth, graphHeight)/2);
        
        //const labels = dataset.labels;
        const dataValues = dataset.values? dataset.values: [];
        const colors = dataset.colors;

        const operation = dataset.operation;

        let totalValues = 0;
        const values = [];

        dataValues.forEach(bucket => {
            const value = Calc.computeOperation(operation, bucket);
            values.push(value);
            totalValues+= value;
        });

        const hole = dataset.hole? dataset.hole: 0;
        const holeRadius = (hole*radius);

        if(values){

            let degrees = -90;

            let startDegrees = degrees;
            
            for(var i = 0; i < values.length; i++){
                //get defaultColor
                const defaultColor = customColors.get(i).code;
               
                const pieColor = colors? colors[i]: defaultColor;

                //set fillColor
                pieColor? tempCtx.fillStyle = pieColor: null;//set bar color if exists

                const value = values[i];
                const label= dataset.labels[i];

                if(!isNaN(value)){

                    const valDecimal = (value/totalValues);
                    degrees += (valDecimal*360);

                    const endDegrees = degrees;

                    const percent = Calc.toFixedIfNeeded(valDecimal*100);

                    DrawPieSlice(dv, tempCtx, startDegrees, endDegrees, holeRadius, label, value, percent, tickFormat, pieColor);

                    startDegrees = endDegrees;
                }
                
            }
        }

        //draw hole in pie to create a daughnut chart
        const halfWidth = graphWidth/2, halfHeight = graphHeight/2;

        tempCtx.globalCompositeOperation = "destination-out";
        tempCtx.globalAlpha = 1;
        tempCtx.beginPath();
        tempCtx.arc((graphX+halfWidth), (graphY+halfHeight), holeRadius, 0, 2 * Math.PI);
        tempCtx.fill();
        tempCtx.globalCompositeOperation = 'source-over';

        ctx.drawImage(tempCanvas, 0, 0);
        
    }else {

        if(dataset){

            const valueAxisName = dataset.yAxis? dataset.yAxis: "y1";
            const labelAxisName = dataset.xAxis? dataset.xAxis: "x1";

            const labelTitle = layout["xAxis"]? layout["xAxis"].title: null;

            const datasetName = dataset.name || "";

            //const axisData = layout.axisData;
            const isHorizontal = dataset.direction === "hr";

            const designColor = dataset.design.color;
            const designSize = dataset.design.size;
            const designText = dataset.design.text; // for tooltip text

            ctx.fillStyle = designColor;
            ctx.strokeStyle = designColor;

            //set xValues to categoryMidPoints if it is a barChart, to be used for mixed charts
            const labels = isHorizontal? dataset.values: dataset.labels;
            const values = isHorizontal? dataset.labels: dataset.values? dataset.values: [];
            
            if(labels){
                
                let lastPosition = {x: null, y: null}, positionType;

                for(var i = 0; i < labels.length; i++){

                    let label = labels[i];
                    let value = values[i];

                    const color = Array.isArray(designColor)? designColor[i]? designColor[i]: designColor[0]: designColor;
                    const size = Array.isArray(designSize)? designSize[i]: designSize;
                    const text = Array.isArray(designText)? designText[i]: designText;
                    
                    positionType = i === 0? "start": i === (labels.length-1)? "end": "";
                    
                    if(value || value === 0){ //proceed if y is valid
     
                        const position = Calc.getAxisPosition(dv, label, value, valueAxisName, labelAxisName);

                        //check if position is out of range
                        const positionIsOut = Calc.posIsOutOfRange(dv, label, value, labelAxisName, valueAxisName);

                        if(type === "line"){
                            if(positionIsOut && (position.x === lastPosition.x || position.y === lastPosition.y)){
                                ctx.stroke();
                                ctx.closePath();
                                break;
                            }else {
                                
                                if(!positionIsOut){
                                    DrawLines(dv, dataset, positionType, size, position, positionIsOut);
                                    lastPosition = position;
                                }
                            }
                        }else if(type === "scatter" || type === "bubble"){

                            if(!positionIsOut){

                                const designLine = dataset.design.line;
                                const lineColor = designLine? designLine.color? designLine.color: color: color;
                                const lineSize = designLine? designLine.size? designLine.size: 0: 0;
                                
                                //set line color and size
                                ctx.fillStyle = color;
                                ctx.strokeStyle = lineColor;
                                ctx.lineWidth = lineSize;
                                
                                DrawPoints(dv, size, position);
                            }
                        }

                        
                        //set tooltip
                        const xAxis = layout.axisData.labels[labelAxisName];
                        const yAxis = layout.axisData.values[valueAxisName];

                        const tickFormat = {label: xAxis.tickFormat, value: yAxis.tickFormat};

                        !positionIsOut? dv.setToolTipData({type: type, radius: size, midPoint: position, label: label, value: value, labelName: labelTitle, valueName: datasetName, size: type === "bubble"? size: null, sizeName: text, color: color, tickFormat: tickFormat}): null;
                        

                    }else {
                        
                        //draw what lines drawn
                        ctx.stroke();

                        //close whatever path drawn
                        ctx.closePath();
                    }
                }

            }

        }
    }
}

export default DrawElements