import * as Calc from '../helpers/math.js'

//import elements
import DrawBars from './bars.js';
import DrawLines from './lines.js';
import DrawPoints from "./points";
import DrawPieSlice from './pie.js';

import customColors from '../helpers/colors.js';

const DrawElements = (dv, type, dataset) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    const colorIndex = (layout.customColorsIndex);

    if(type === "bars"){

        const categories = dataset.categories;

        const maxBarPerCategory = dataset.maxBarPerCategory;
        const catKeys = Array.from(categories.keys());

        const isHorizontal = dataset.direction === "hr";

        const graphPosition = layout.graphPosition;
        const graphLength = isHorizontal? graphPosition.height: graphPosition.width;

        const catSize = dataset.categories.size;

        const step = (graphLength/catSize);
        let barSize = (step/(maxBarPerCategory+1));

        if(dataset.labelIsAllNumbers){
            const axisData = layout.axisData;

            const axis = isHorizontal? axisData.values["y1"]: axisData.labels["x1"];
            const range = axis.range;

            const rangeStart = range[0], rangeEnd = range[1];
            const rangeLength = (rangeEnd-rangeStart);
            
            const labelDiff = [];
            for(let i = 0; i < catKeys.length; i++){
                const key = parseInt(catKeys[i]);
                const nextKey = parseInt(catKeys[i+1]);

                nextKey? labelDiff.push(Math.abs(nextKey-key)): null;
            }

            const minDiff = Math.min(...labelDiff);

            minDiff? barSize = (minDiff/rangeLength)*graphLength: null;

        }

        for(var i = 0; i < catKeys.length; i++){
            const catKey = catKeys[i];
            const category = categories.get(catKey);

            DrawBars(dv, category, catKey, dataset, barSize);
        }

        if(maxBarPerCategory){
            layout.customColorsIndex = (colorIndex+maxBarPerCategory);
        }
        

    }else if(type === "pie"){

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
            console.log("Bucket: ", bucket);
            const value = Calc.computeOperation(operation, bucket);
            values.push(value);
            totalValues+= value;
        });

        if(values){

            let degrees = -90;

            let startDegrees = degrees;
            
            for(var i = 0; i < values.length; i++){
                //get defaultColor
                const defaultColor = customColors[i].code;
               
                const pieColor = colors? colors[i]: null;

                //set fillColor
                const fillColor = pieColor? pieColor: defaultColor;
                fillColor? tempCtx.fillStyle = fillColor: null;//set bar color if exists

                const value = values[i];

                if(!isNaN(value)){

                    const valPercent = (value/totalValues);
                    degrees += (valPercent*360);

                    const endDegrees = degrees;

                    DrawPieSlice(dv, tempCtx, startDegrees, endDegrees);

                    startDegrees = endDegrees;
                }
                
            }
        }

        //draw hole in pie to create a daughnut chart
        const halfWidth = graphWidth/2, halfHeight = graphHeight/2;

        const hole = dataset.hole? dataset.hole: 0;
        const holeRadius = (hole*radius);

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

            //const axisData = layout.axisData;
            const isHorizontal = dataset.direction === "hr";

            const designColor = dataset.design.color;
            const designSize = dataset.design.size;

            ctx.fillStyle = designColor;
            ctx.strokeStyle = designColor;

            //set xValues to categoryMidPoints if it is a barChart, to be used for mixed charts
            const labels = isHorizontal? dataset.values: dataset.labels;
            const values = isHorizontal? dataset.labels: dataset.values? dataset.values: [];
            
            if(labels){

                console.log("lab: ", labels, "vals: ", values);
                
                for(var i = 0; i < labels.length; i++){

                    let label = labels[i];
                    let value = values[i];

                    const color = Array.isArray(designColor)? designColor[i]: designColor;
                    const size = Array.isArray(designSize)? designSize[i]: designSize;
                    
                    const positionType = i === 0? "start": i === (labels.length-1)? "end": "";
                    
                    if(value || value === 0){ //proceed if y is valid

                        const position = Calc.getAxisPosition(dv, label, value, valueAxisName, labelAxisName);

                        if(type === "arcs"){

                        }else if(type === "lines"){
                            DrawLines(dv, dataset, positionType, size, position);
                        }else if(type === "points"){

                            const designLine = dataset.design.line;
                            const lineColor = designLine? designLine.color? designLine.color: color: color;
                            const lineSize = designLine? designLine.size? designLine.size: 0: 0;
                            
                            //set line color and size
                            ctx.fillStyle = color;
                            ctx.strokeStyle = lineColor;
                            ctx.lineWidth = lineSize;
                            
                            DrawPoints(dv, size, position);
                        }

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