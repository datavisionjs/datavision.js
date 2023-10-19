
import Scatter from './scatter.js'
import Bar from './bar.js'
import Line from './line.js'
import Pie from './pie.js'

const Chart = (ctx) => {

    for(let i  = 0; i < data.length; i++){

        const dataSet = data[i];
        const type = dataSet.type;

        if(type){

            if(type === "line"){

                Line(ctx, dataSet, layout);
            }if(type === "scatter"){

                Scatter(ctx, dataSet, layout);
            }
        }

    }
}

export default Chart;