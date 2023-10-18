
const DrawPoints = (ctx, size, x, y) => {

    ctx.beginPath();

    //add style 
    ctx.fillStyle = "blue";

    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
       
}

export default DrawPoints