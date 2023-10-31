
import Scatter from './scatter.js'
import Bar from './bar.js'
import Line from './line.js'
import Pie from './pie.js'

const Chart = (ctx) => {

    const defaultColor = "#5570a3";

    //get the data type of the dataset
    const firstDataType = data[0]? data[0].type: null;

    if(firstDataType === "bar"){
        ctx.fillStyle = defaultColor;//implement default color if no color is specified

        Bar(ctx);
    }else {

        for(let i  = 0; i < data.length; i++){

            const dataset = data[i];
            const type = dataset.type;

            //dataset properties
            const strokeColor = dataset.strokeColor? dataset.strokeColor: defaultColor;
            const fillColor = dataset.fillColor? dataset.fillColor: strokeColor;

            //universal styles
            ctx.lineJoin = "round";
            ctx.strokeStyle = strokeColor;
            ctx.fillStyle = fillColor;

            if(type){

                if(type === "line"){

                    Line(ctx, dataset);
                }else if(type === "scatter"){
                    
                    Scatter(ctx, dataset);
                }
            }

        }
    }

}

export default Chart;