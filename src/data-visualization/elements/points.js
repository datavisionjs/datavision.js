import * as Calc from '../helpers/math.js'


const DrawPoints = (ctx, size, position) => {

    const pos = Calc.posOnGraph(ctx, position);

    if(pos){
        ctx.beginPath();

        //add style 
        ctx.fillStyle = "blue";

        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    } 
}

export default DrawPoints