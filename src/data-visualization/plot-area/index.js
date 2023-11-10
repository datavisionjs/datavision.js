//import helpers
import * as Prop from '../helpers/properties.js'

import DrawAxis from "./axis";
import DrawArc from './arc.js';

const plotArea = (dv) => {
    const layout = dv.getLayout();
    const type = layout.firstDataType;
    
    const axisCharts = ["line", "scatter", "bar"];

    if(axisCharts.includes(type)){
        //set ranges to layout
        if(type === "bar"){
            layout.isBarChart = true;
            Prop.setBar(dv);
        }else {
            Prop.setRanges(dv);
        }

        //draw axis
        DrawAxis(dv);

    }else if(type === "pie"){

        layout.isPieChart = true;
        Prop.setPie(dv);
        
        //draw arc
        DrawArc(dv);
    }
};

export default plotArea;