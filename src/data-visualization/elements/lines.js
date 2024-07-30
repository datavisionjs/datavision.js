import * as Calc from '../helpers/math.js'


const DrawLines = (dv, dataset, type, size, position, lastPosition, boundPosition, positionIsOut) => {

    const mode = dataset.mode;

    const ctx = dv.getCtx();

    const layout = dv.getLayout();
    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    //add style 
    ctx.lineWidth = size;

    const labelStyle = dv.getStyle().label;
    const fontSize = labelStyle.fontSize;
   

    //draw lines coming from out of bounds points
    //DrawOutOfBoundLines(dv, position, axisName);
    

    //draw lines and arc within graph bounds
    if(position){

        if(position.x > (graphX+graphWidth)){
            const newX = (graphX+graphWidth);
            position.y = Calc.linearInterpolationX(
                newX, 
                lastPosition.x,
                lastPosition.y,
                position.x,
                position.y
            );
            position.x = newX;

        }else if(position.x < (graphX)){
            if(boundPosition.next && boundPosition.prev){
                const newX = (graphX-(fontSize/2));
                position.y = Calc.linearInterpolationX(
                    newX, 
                    boundPosition.next.x,
                    boundPosition.next.y,
                    boundPosition.prev.x,
                    boundPosition.prev.y
                );
                position.x = newX;
            }
        }

        if(position.y > (graphY+graphHeight)){
            const newY = (graphY+graphHeight);
            position.x = Calc.linearInterpolationY(
                newY,
                boundPosition.next.x,
                boundPosition.next.y,
                position.x,
                position.y
            );
            position.y = newY;

        }else if(position.y < (graphY)){
            
                const newY = (graphY);

                position.x = Calc.linearInterpolationY(
                    newY, 
                    position.x,
                    position.y,
                    lastPosition.x,
                    lastPosition.y
                );

                position.y = newY;
            
        }

        if(type === "start"){
            ctx.beginPath();
            ctx.moveTo(position.x, position.y);
        }else {

            ctx.lineTo(position.x, position.y);
        }

        if(mode === "scatter" && !positionIsOut){
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.arc(position.x, position.y, (size/2) || 1, 0, Math.PI * 2)
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(position.x, position.y);
        }

    }

    
    if(type === "end"){
        ctx.stroke();
        ctx.closePath();
    }
    
}

export default DrawLines