import * as Calc from '../helpers/math.js'

//import elements
import DrawBars from './bars.js';
import DrawLines from './lines.js';
import DrawPoints from "./points";

import customColors from '../helpers/colors.js';

const DrawElements = (ctx, type, dataset) => {

    const colorIndex = (layout.customColorsIndex);

    console.log("index: ", colorIndex);

    if(type === "bars"){

        if(layout.isBarChart){
            const categories = dataset.barCategories;

            const maxBarPerCategory = dataset.categoryBarMax;
            const catKeys = Array.from(categories.keys());

            const graphPosition = layout.graphPosition;
            const graphX = graphPosition.x, graphWidth = graphPosition.width;

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

export default DrawElements