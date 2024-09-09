//import helpers
import * as Prop from '../helpers/properties.js'

import DrawAxis from "./axis";
import DrawArc from './arc.js';
import DrawTable from './table.js';

import DrawTitleLabel from './title.js';

const plotArea = (dv) => {
    const layout = dv.getLayout();
    
    //draw axis 
    layout.hasAxisData? DrawAxis(dv): null;
    
     //draw arc
    layout.hasPieData? DrawArc(dv): null;

    //draw table
    layout.hasTableData? DrawTable(dv): null;

    //draw title
    DrawTitleLabel(dv);
};

export default plotArea;