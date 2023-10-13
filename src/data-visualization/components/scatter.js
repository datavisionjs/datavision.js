import * as Calc from '../helpers/math.js'

const Scatter = (ctx, dataSet, layout) => {
    
    if(dataSet){

        const xValues = dataSet.x;
        const yValues = dataSet.y;

        for(var i = 0; i < xValues.length; i++){
            const x = xValues[i];
            const y = yValues[i];

            if(y){ //proceed if y is valid

                const position = Calc.dataPosition(ctx, {x: x, y: y}, layout);

                if(position){
                    ctx.beginPath();
                    ctx.arc(position.x, position.y, 5, 0, Math.PI * 2);
                    ctx.fillStyle = "blue";
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }
}

export default Scatter;