

const GetStyle = (dv) => {
    const canvas = dv.getCanvas();
    const canvasWidth = canvas.width;

    const title = {fontFamily: "Helvetica Neue, Helvetica, 'Arial, sans-serif", fontWeight: "bold"};
    const label = {fontFamily: "Helvetica Neue, Helvetica, 'Arial, sans-serif"};

    //set sizes
    if(canvasWidth < 600){
        title.fontSize = 16;
        label.fontSize = 12;
    }else if(canvasWidth < 1200){
        title.fontSize = 20;
        label.fontSize = 14;
    }else {
        title.fontSize = 24;
        label.fontSize = 18;
    }

    //set fontFamily

    
    return {
        title: title,
        label: label,
    };

}

export default GetStyle;