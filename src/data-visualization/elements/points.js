import * as Calc from '../helpers/math.js'


const DrawPoints = (dv, size, position) => {

    const ctx = dv.getCtx();

    const pos = Calc.posOnGraph(dv, position);

    if(pos){
        ctx.beginPath();

        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    } 
}

export default DrawPoints