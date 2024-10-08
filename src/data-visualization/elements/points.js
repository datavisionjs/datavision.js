import * as Calc from '../helpers/math.js'


const DrawPoints = (dv, ctx, size, position) => {

    
    if(position){
        ctx.beginPath();

        ctx.arc(position.x, position.y, size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }
}

export default DrawPoints