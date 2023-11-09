//import helpers
import * as Prop from '../helpers/properties.js'

import DrawAxis from "./axis";
import DrawArc from './arc.js';

const plotArea = (ctx, type) => {
    
    const axisCharts = ["line", "scatter", "bar"];

    if(axisCharts.includes(type)){
        //set ranges to layout
        if(type === "bar"){
            layout.isBarChart = true;
            Prop.setBar();
        }else {
            Prop.setRanges();
        }

        //draw axis
        DrawAxis(ctx);

    }else if(type === "pie"){

        layout.isPieChart = true;
        Prop.setPie();
        
        //draw arc
        DrawArc(ctx);
    }
};

export default plotArea;