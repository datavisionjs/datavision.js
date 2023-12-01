//import helpers
import * as Prop from '../helpers/properties.js'

import DrawAxis from "./axis";
import DrawArc from './arc.js';

const plotArea = (dv) => {
    //set chart properties
    Prop.setUpChart(dv);
    Prop.setGraphPosition(dv);

    const layout = dv.getLayout();
    
    //draw axis 
    layout.hasAxisData? DrawAxis(dv): null;
    
     //draw arc
    layout.hasPieData? DrawArc(dv): null;
};

export default plotArea;