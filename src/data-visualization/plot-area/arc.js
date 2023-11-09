import * as Calc from '../helpers/math.js'

import DrawTitleLabel from './titleLabel.js';
import customColors from '../helpers/colors.js';

function drawLabels(ctx, graphPosition){
    const canvas = ctx.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const fontSize = layout.fontSize;
    ctx.font = fontSize+"px Arial";

    if(layout.isPieChart){
        const dataset = data[0];

        const graphX = graphPosition.x, graphY = graphPosition.y;
        const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

        const labelWidth = canvasWidth-(graphX+graphWidth);
        const labelHeight = canvasHeight-graphY;
        const labelX = (graphX+graphWidth)+(fontSize*2);

        let startY = graphY;


        if(dataset){
            const categories = dataset.pieCategories;

            if(categories){
                const catKeys = Array.from(categories.keys());

                let pixelSpace = (fontSize*2);

                if((catKeys*(fontSize*2)) >= graphHeight){
                    pixelSpace = Math.round(labelHeight/catKeys.length);
                }

                for (let i = 0; i < catKeys.length; i++) {

                    //set fillColor
                    const defaultColor = customColors[i].code;

                    const fillColor = defaultColor;
                    fillColor? ctx.fillStyle = fillColor: null;//set bar color if exists

                    const catKey = catKeys[i];
                    const category = categories.get(catKey);

                    const value = category.value;

                    if(!isNaN(value)){
                        //set text width
                        const textWidth = ctx.measureText(catKey).width;

                        const textPosX = (labelX+(fontSize)), textPosY = startY;

                        ctx.beginPath();
                        ctx.arc(labelX, startY, (fontSize/2), 0, 2*Math.PI);
                        ctx.fill();

                        //add text
                        ctx.beginPath();
                        ctx.fillStyle = "black";
                        ctx.textAlign = "start";
                        ctx.textBaseline = "middle";
                        ctx.fillText(catKey, textPosX, textPosY);

                        startY += pixelSpace;
                    }
                }
            }
        }
    }
}

const DrawArc = (ctx) => {

    //stores the position and dimensions of the graph area
    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    const radius = layout.arcRadius;
    const arcCenterX = (graphX+(graphWidth/2)), arcCenterY = (graphY+radius);

    console.log(graphX, (graphWidth/2), ctx.canvas.width);

    //draw a rectangle representing the graph area
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.arc(arcCenterX, arcCenterY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    //labels around the graph area
    DrawTitleLabel(ctx);
    drawLabels(ctx, graphPosition);
}

export default DrawArc;