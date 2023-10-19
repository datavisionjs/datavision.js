import * as Calc from '../helpers/math.js'

//keep track of position out of graph bounds
let outOfGraphBounds = null;
let isOutOfGraphBounds = false;

const DrawLines = (ctx, type, size, position) => {

    const ranges = Calc.findRanges();
    const xRange = ranges.xRange;
    const xRangeStart = xRange[0];
    const xRangeEnd = xRange[1];

    const pos = Calc.posOnGraph(ctx, position);

    //draw lines coming out of graph bounds
    if(pos){

        //draw lines from left bound
        if(isOutOfGraphBounds){

            const x1 = outOfGraphBounds.x;
            const y1 = outOfGraphBounds.y;

            const x2 = position.x;
            const y2 = position.y;

            const leftBoundY = Calc.linearInterpolation(xRangeStart, x1, y1, x2, y2);

            const leftBoundPos  = {x: xRangeStart, y: leftBoundY};

            const newPos = Calc.posOnGraph(ctx, leftBoundPos);

            ctx.beginPath();
            ctx.moveTo(newPos.x, newPos.y);
    
            //add style 
            ctx.strokeStyle = "blue";
            ctx.lineWidth = size;
    
            ctx.lineTo(pos.x, pos.y);

        }

        isOutOfGraphBounds = false;
    }else {

        outOfGraphBounds = position;
        isOutOfGraphBounds = true;
    }


    //draw lines within graph bounds
    if(pos){
        if(type === "start"){
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        }else {

            //add style 
            ctx.strokeStyle = "blue";
            ctx.lineWidth = size;

            ctx.lineTo(pos.x, pos.y);
        }
    }

    
    if(type === "end"){

        //reset out of graph bounds variables
        outOfGraphBounds = null;
        isOutOfGraphBounds = true;

        ctx.stroke();
        ctx.closePath();
    }
}

export default DrawLines