import * as Calc from '../helpers/math.js'

//keep track of position out of graph bounds
let lastOutOfGraphBoundPos = null;
let isOutOfGraphBounds = false;
let isLeftBoundDone = false;

let lastGraphBoundPos = null; //stores position on graph

const DrawOutOfBoundLines = (dv, position, axisName) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();

    if(!layout.isBarChart){

        const axisData = layout.axisData;
        const axis = axisData.labels[axisName];

        
        const xRange = axis.range;
        const xRangeStart = xRange? xRange[0]: null;
        const xRangeEnd = xRange? xRange[1]: null;

        //draw lines coming out of graph bounds
        if(position){

            //draw lines from left bound
            if(isOutOfGraphBounds){
                const x1 = lastOutOfGraphBoundPos.x;
                const y1 = lastOutOfGraphBoundPos.y;

                const x2 = position.x;
                const y2 = position.y;

                const leftBoundY = Calc.linearInterpolation(xRangeStart, x1, y1, x2, y2);

                const leftBoundPos  = {x: xRangeStart, y: leftBoundY};

                //const newPos = Calc.posOnGraph(dv, leftBoundPos);

                if(newPos){
                    ctx.beginPath();
                    ctx.moveTo(leftBoundPos.x, leftBoundPos.y);
            
                    ctx.lineTo(position.x, position.y);
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

                //const newPos = Calc.posOnGraph(dv, rightBoundPos);

                if(newPos){
                    ctx.lineTo(rightBoundPos.x, rightBoundPos.y);
                }

                //reset left bound done
                isLeftBoundDone = false;
            }
        }
    }
};

const DrawLines = (dv, dataset, type, size, position) => {

    const axisName = dataset.xAxis? dataset.xAxis: "x1";

    const ctx = dv.getCtx();

    //add style 
    ctx.lineWidth = size;
    ctx.lineCap = "round";

    //draw lines coming from out of bounds points
    DrawOutOfBoundLines(dv, position, axisName);

    //draw lines and arc within graph bounds
    if(position){

        if(type === "start"){

            ctx.beginPath();
            ctx.moveTo(position.x, position.y);

        }else {

            ctx.lineTo(position.x, position.y);

            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(position.x, position.y);

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