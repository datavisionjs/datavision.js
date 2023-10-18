const DrawLines = (ctx, type, size, x, y) => {

    if(type === "start"){
        ctx.beginPath();

        //add style 
        ctx.strokeStyle = "blue";
        
        ctx.moveTo(x, y);
    }else {
        ctx.lineTo(x, y)
    }

    if(type === "end"){
        ctx.stroke();
        ctx.closePath();
    }    
}

export default DrawLines