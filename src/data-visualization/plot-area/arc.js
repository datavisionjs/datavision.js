import * as Calc from '../helpers/math.js';
import * as Global from '../helpers/global.js';

import DrawTitleLabel from './titleLabel.js';
import customColors from '../helpers/colors.js';

function drawLabels(dv, graphPosition){
    const ctx = dv.getCtx();
    const data = dv.getData();
    const layout = dv.getLayout();

    const labelStyle = dv.getStyle().label;

    const canvas = ctx.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const fontSize = labelStyle.fontSize;
    ctx.font = fontSize+"px "+labelStyle.fontFamily;

    
    const dataset = layout.pieData;
    const maxLabelWidth = dataset.maxLabelWidth;

    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    const labelAreaWidth = (canvasWidth-(graphX+graphWidth));
    const labelAreaHeight = (canvasHeight-graphY);

    const labelX = (graphX+graphWidth);

    let startY = graphY;

    if(dataset){
        const labels = dataset.labels;
        const values = dataset.values;
        const colors = dataset.colors;

        if(labels){

            let pixelSpace = (fontSize*2);

            if((labels.length*(fontSize*2)) >= graphHeight){
                pixelSpace = Math.round(labelAreaHeight/labels.length);
            }

            for (let i = 0; i < labels.length; i++) {

                //set defualtColor
                const defaultColor = customColors[i].code;

                let label = labels[i];
                const labelWidth = ctx.measureText(label).width;

                if((labelWidth+fontSize) > labelAreaWidth){
                    if(label.length > 3){
                        const estSizePerChar = (labelWidth/label.length);
                        label = Global.shortenText(label, Math.floor((labelAreaWidth-(fontSize*2))/estSizePerChar));
                        console.log(label);
                    }
                }
                
                
                const value = values[i];

                const pieColor = colors? colors[i]: null;

                const fillColor = pieColor? pieColor: defaultColor;
                fillColor? ctx.fillStyle = fillColor: null;//set bar color if exists

                if(!isNaN(value)){
                    //set text width
                    //const textWidth = ctx.measureText(label).width;

                    const textPosX = (labelX+(fontSize)), textPosY = startY;

                    ctx.beginPath();
                    ctx.arc(labelX, startY, (fontSize/2), 0, 2*Math.PI);
                    ctx.fill();

                    //add text
                    ctx.beginPath();
                    ctx.fillStyle = "black";
                    ctx.textAlign = "start";
                    ctx.textBaseline = "middle";
                    ctx.fillText(label, textPosX, textPosY);

                    startY += pixelSpace;
                }
            }
        }
    }
    
}

const DrawArc = (dv) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    //stores the position and dimensions of the graph area
    const graphPosition = layout.pieGraphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    const radius = Calc.getArcRadius(graphWidth, graphHeight);
    const arcCenterX = (graphX+(graphWidth/2)), arcCenterY = (graphY+radius);

    console.log(graphX, (graphWidth/2), ctx.canvas.width);

    //draw a rectangle representing the graph area
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.arc(arcCenterX, arcCenterY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    //labels around the graph area
    DrawTitleLabel(dv);
    drawLabels(dv, graphPosition);
}

export default DrawArc;