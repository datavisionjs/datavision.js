import * as Calc from '../helpers/math.js'


const DrawPoints = (dv, ctx, size, position) => {

    
    if(position){
        ctx.beginPath();
        ctx.globalAlpha = 0.7;
        ctx.arc(position.x, position.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.arc(position.x, position.y, size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
    }
}

export default DrawPoints