import * as Calc from '../helpers/math.js'


const DrawLines = (dv, ctx, dataset, type, color, size, position, positionIsOut) => {

    const mode = dataset.mode;

    const layout = dv.getLayout();
    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    //add style 
    ctx.lineWidth = size;
   

    //draw lines coming from out of bounds points
    //DrawOutOfBoundLines(dv, position, axisName);
    

    //draw lines and arc within graph bounds
    if(position){

        if(type === "start"){
            ctx.beginPath();

            ctx.moveTo(position.x, position.y);
        }else {
            ctx.lineTo(position.x, position.y);
        }

        ctx.strokeStyle = color;

        if(mode === "scatter" && !positionIsOut){
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(position.x, position.y, (size/2) || 1, 0, Math.PI * 2)
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(position.x, position.y);
        }

    }

    
    if(type === "end"){
        ctx.stroke();
    }
    
}

export default DrawLines