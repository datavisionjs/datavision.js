import * as Calc from '../helpers/math.js'

//import elements
import DrawBars from './bars.js';
import DrawLines from './lines.js';
import DrawPoints from "./points";
import DrawPieSlice from './pie.js';

import customColors from '../helpers/colors.js';

const DrawElements = (ctx, type, dataset) => {

    const colorIndex = (layout.customColorsIndex);

    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    if(type === "bar"){

        if(layout.isBarChart){
            const categories = dataset.barCategories;

            const maxBarPerCategory = dataset.categoryBarMax;
            const catKeys = Array.from(categories.keys());

            const categoryMidPoints = [];

            const step = (graphWidth/catKeys.length);
            let midPoint = (graphX+(step/2));

            for(var i = 0; i < catKeys.length; i++){
                const catKey = catKeys[i];
                const category = categories.get(catKey);

                DrawBars(ctx, category, catKey, dataset);

                //push mid point and increment by step;
                categoryMidPoints.push(midPoint);
                midPoint += step;
            }

            if(maxBarPerCategory){
                layout.customColorsIndex = (colorIndex+maxBarPerCategory);
            }


            //set categories mid points to barData 
            //the mid points will be used as x values to plot lines for mixed charts
            layout.barData.categoryMidPoints = categoryMidPoints;
        }

    }else if(type === "pie"){
        
        if(layout.isPieChart){
            const categories = dataset.pieCategories;
            const valuesLength = dataset.valuesLength;

            if(categories){
                const catKeys = Array.from(categories.keys());

                let degrees = -90;

                let startDegrees = degrees;
                
                for(var i = 0; i < catKeys.length; i++){
                    //get defaultColor
                    const defaultColor = customColors[i].code;

                    //begin
                    const catKey = catKeys[i];
                    const category = categories.get(catKey);
                    
                    const pieColor = category.pieColor;

                    //set fillColor
                    const fillColor = pieColor? pieColor: defaultColor;
                    fillColor? ctx.fillStyle = fillColor: null;//set bar color if exists

                    const value = category.value;

                    if(!isNaN(value)){
                        const valPercent = (value/valuesLength);
                        degrees += (valPercent*360);

                        const endDegrees = degrees;

                        DrawPieSlice(ctx, startDegrees, endDegrees);

                        startDegrees = endDegrees;
                    }
                    
                }
            }

        }
    }else {

        if(dataset){

            const defaultColor = customColors[colorIndex].code;

            let fillColor = dataset.fillColor;
            let strokeColor = dataset.strokeColor;

            if(!strokeColor){
                strokeColor = defaultColor;
            }

            if(!fillColor){
                fillColor = defaultColor;
            }

            layout.customColorsIndex = (colorIndex+1);

            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;

            //set xValues to categoryMidPoints if it is a barChart, to be used for mixed charts
            const xValues = !layout.isBarChart? dataset.x: layout.barData.categoryMidPoints;;
            const yValues = dataset.y;

            if(xValues){
                
                for(var i = 0; i < xValues.length; i++){

                    const x = xValues[i];
                    const y = yValues[i];

                    const size = 4;
                    
                    const positionType = i === 0? "start": i === (xValues.length-1)? "end": "";
                    
                    if(y || y === 0){ //proceed if y is valid

                        const position = {x: x, y: y};

                        if(type === "arcs"){

                        }else if(type === "lines"){

                            DrawLines(ctx, positionType, size, position);

                        }else if(type === "points"){

                            DrawPoints(ctx, size, position);
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