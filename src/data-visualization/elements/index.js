import * as Calc from '../helpers/math.js'

//import elements
import DrawBars from './bars.js';
import DrawLines from './lines.js';
import DrawPoints from "./points";

const DrawElements = (ctx, type, dataSet) => {

    if(type === "bars"){

        let ranges = layout.ranges;

        const categories = ranges.barCategories;
        const catKeys = Array.from(categories.keys());

        for(var i = 0; i < catKeys.length; i++){
            const catKey = catKeys[i];
            const category = categories.get(catKey);

            DrawBars(ctx, category, catKey);
        }
    }else {

        if(dataSet){

            const xValues = dataSet.x;
            const yValues = dataSet.y;

            for(var i = 0; i < xValues.length; i++){
                const x = xValues[i];
                const y = yValues[i];

                const size = 4;
                
                const positionType = i === 0? "start": i === (xValues.length-1)? "end": "";
                
                if(y || y === 0){ //proceed if y is valid

                    const position = {x: x, y: y};

                    if(type === "arcs"){

                    }else if(type === "lines"){

                        DrawLines(ctx, positionType, size, position);

                    }else if(type === "points"){

                        DrawPoints(ctx, size, position);
                    }

                }else {
                    
                    //draw what lines drawn
                    ctx.stroke();

                    //close whatever path drawn
                    ctx.closePath();
                }
            }

        }
    }
}

export default DrawElements