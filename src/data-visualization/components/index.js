
import Scatter from './scatter.js'
import Bar from './bar.js'
import Line from './line.js'
import Pie from './pie.js'

const Chart = (ctx) => {

    for(let i  = 0; i < data.length; i++){

        const dataset = data[i];
        const type = dataset.type;

        const defaultColor = "#5570a3";

        //dataset properties
        const strokeColor = dataset.strokeColor? dataset.strokeColor: defaultColor;
        const fillColor = dataset.fillColor? dataset.fillColor: strokeColor;

        //universal styles
        ctx.lineJoin = "round";
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = fillColor;

        if(type){

            if(type === "line"){

                Line(ctx, dataset, layout);
            }if(type === "scatter"){
                
                Scatter(ctx, dataset, layout);
            }
        }

    }
}

export default Chart;