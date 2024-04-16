import * as Calc from '../helpers/math.js'


const DrawLines = (dv, dataset, type, size, position, positionIsOut) => {

    const mode = dataset.mode;

    const ctx = dv.getCtx();

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