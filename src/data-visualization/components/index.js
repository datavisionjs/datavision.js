
import Scatter from './scatter.js';
import Bar from './bar.js';
import Line from './line.js';
import Pie from './pie.js';



const Chart = (dv) => {
    const ctx = dv.getCtx();
    const data = dv.getData();

    for(let i  = 0; i < data.length; i++){

        const dataset = data[i];
        const type = dataset.type;

        if(type){
            if(type === "line"){
                
                Line(dv, dataset);

            }else if(type === "scatter" || "bubble"){

                Scatter(dv, dataset);

            }else if(type === "bar"){
                Bar(dv, dataset);
            }else if(type === "pie"){

                Pie(dv, dataset);
            }
        }

    }

}

export default Chart;