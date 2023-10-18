import * as Calc from '../helpers/math.js'

//import elements
import DrawLines from './lines.js';
import DrawPoints from "./points";

const DrawElements = (ctx, type, dataSet) => {

    if(dataSet){

        const xValues = dataSet.x;
        const yValues = dataSet.y;

        for(var i = 0; i < xValues.length; i++){
            const x = xValues[i];
            const y = yValues[i];

            const size = 4;
            
            const positionType = i === 0? "start": i === (xValues.length-1)? "end": "";
            
            if(y){ //proceed if y is valid
    
                const position = Calc.dataPosition(ctx, {x: x, y: y}, layout);
    
                if(position){

                    if(type === "arcs"){

                    }else if(type === "bars"){
            
                    }else if(type === "lines"){
                        console.log(type);
                        DrawLines(ctx, positionType, size, position.x, position.y);
                    }else if(type === "points"){

                        DrawPoints(ctx, size, position.x, position.y);
                    }
                }
            }
        }

    }
}

export default DrawElements