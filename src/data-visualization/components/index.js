
import Scatter from './scatter.js'
import Bar from './bar.js'
import Line from './line.js'
import Pie from './pie.js'

const Chart = (ctx, data, layout) => {

    for(let i  = 0; i < data.length; i++){

        const set = data[i];
        const type = set.type;

        if(type){
            if(type === "scatter"){
                Scatter(ctx, set, layout);
            }
        }

    }
}

export default Chart;