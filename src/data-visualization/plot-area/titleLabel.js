

const DrawTitleLabel = (ctx) => {
    const canvas = ctx.canvas;

    const canvasWidth = canvas.width;

    const position = layout.graphPosition;
    const graphY = position.y;

    let title = layout.title;

    //set text alignment
    ctx.textAlign = 'center'; 

    if(title){
        //draw Title
        ctx.beginPath();

        const fontSize = 20;
        ctx.font = fontSize+"px Arial";

        ctx.fillText(title, (canvasWidth/2), ((graphY/2)+(fontSize/2)));
        ctx.closePath();
    }
}

export default DrawTitleLabel;