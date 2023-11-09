import * as Calc from '../helpers/math.js'

//keep track of position out of graph bounds
let lastOutOfGraphBoundPos = null;
let isOutOfGraphBounds = false;
let isLeftBoundDone = false;

let lastGraphBoundPos = null; //stores position on graph

const DrawOutOfBoundLines = (ctx, pos, size, position) => {

    if(!layout.isBarChart){
        const ranges = layout.ranges;
        const xRange = ranges.xRange;
        const xRangeStart = xRange? xRange[0]: null;
        const xRangeEnd = xRange? xRange[1]: null;

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
            if(isLeftBoundDone || lastGraphBoundPos){
                const x1 = lastGraphBoundPos.x;
                const y1 = lastGraphBoundPos.y;

                const x2 = position.x;
                const y2 = position.y;

                const rightBoundY = Calc.linearInterpolation(xRangeEnd, x1, y1, x2, y2);

                const rightBoundPos = {x: xRangeEnd, y: rightBoundY};

                const newPos = Calc.posOnGraph(ctx, rightBoundPos);

                if(newPos){
                    ctx.lineTo(newPos.x, newPos.y);
                }

                //reset left bound done
                isLeftBoundDone = false;
            }
        }
    }
};

const DrawLines = (ctx, type, size, position) => {

    let pos = null;

    if(layout.isBarChart){
        const y = Calc.posOnGraphYAxis(ctx, position.y);
        pos = {x: position.x, y: y};
    }else {
        pos = Calc.posOnGraph(ctx, position);
    }

    //add style 
    ctx.lineWidth = size;

    //draw lines coming from out of bounds points
    DrawOutOfBoundLines(ctx, pos, size, position);

    //draw lines and arc within graph bounds
    if(pos){

        if(type === "start"){

            //draw circle at the points
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);

        }else {

            ctx.lineTo(pos.x, pos.y);

            ctx.stroke();
            ctx.closePath();

            //draw circle at the points
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);

        }

    }

    
    if(type === "end"){

        //reset out of graph bounds variables
        lastOutOfGraphBoundPos = null;
        isOutOfGraphBounds = false;
        isLeftBoundDone = false;

        lastGraphBoundPos = null;

        ctx.stroke();
        ctx.closePath();
    }
}

export default DrawLines