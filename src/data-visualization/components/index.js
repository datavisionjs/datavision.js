
import Scatter from './scatter.js'
import Bar from './bar.js'
import Line from './line.js'
import Pie from './pie.js'

const Chart = (ctx) => {

    for(let i  = 0; i < data.length; i++){

        const dataset = data[i];
        const type = dataset.type;

        //universal styles
        ctx.lineJoin = "round";

        if(type){

            if(type === "line"){

                Line(ctx, dataset);

            }else if(type === "scatter"){


                Scatter(ctx, dataset);

            }else if(type === "bar"){

                Bar(ctx, dataset);
            }else if(type === "pie"){

                Pie(ctx, dataset);
            }
        }

    }
    

}

export default Chart;