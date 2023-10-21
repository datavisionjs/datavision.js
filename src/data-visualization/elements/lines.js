import * as Calc from '../helpers/math.js'

//keep track of position out of graph bounds
let lastOutOfGraphBoundPos = null;
let isOutOfGraphBounds = false;
let isLeftBoundDone = false;

let lastGraphBoundPos = null; //stores position on graph

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
            const x1 = lastOutOfGraphBoundPos.x;
            const y1 = lastOutOfGraphBoundPos.y;

            const x2 = position.x;
            const y2 = position.y;

            const leftBoundY = Calc.linearInterpolation(xRangeStart, x1, y1, x2, y2);

            const leftBoundPos  = {x: xRangeStart, y: leftBoundY};

            const newPos = Calc.posOnGraph(ctx, leftBoundPos);

            if(newPos){
                ctx.beginPath();
                ctx.moveTo(newPos.x, newPos.y);
        
                //add style 
                ctx.strokeStyle = "blue";
                ctx.lineWidth = size;
        
                ctx.lineTo(pos.x, pos.y);
            }

            isLeftBoundDone = true;
        }

        //set position on graph 
        lastGraphBoundPos = position;
        //
        isOutOfGraphBounds = false;
    }else {
        lastOutOfGraphBoundPos = position;
        isOutOfGraphBounds = true;

        //draw lines from right bound
        if(isLeftBoundDone){
            const x1 = lastGraphBoundPos.x;
            const y1 = lastGraphBoundPos.y;

            const x2 = position.x;
            const y2 = position.y;

            const rightBoundY = Calc.linearInterpolation(xRangeEnd, x1, y1, x2, y2);

            const rightBoundPos = {x: xRangeEnd, y: rightBoundY};

            const newPos = Calc.posOnGraph(ctx, rightBoundPos);

            if(newPos){
                //add style 
                ctx.strokeStyle = "blue";
                ctx.lineWidth = size;
        
                ctx.lineTo(newPos.x, newPos.y);
            }

            //reset left bound done
            isLeftBoundDone = false;
        }
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
        lastOutOfGraphBoundPos = null;
        isOutOfGraphBounds = true;
        isLeftBoundDone = false;

        ctx.stroke();
        ctx.closePath();
    }
}

export default DrawLines