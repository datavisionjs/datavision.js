//import helpers
import * as Prop from '../helpers/properties.js'

import DrawAxis from "./axis";
import DrawArc from './arc.js';

import DrawTitleLabel from './title-label.js';
import DrawDatasetNames from './dataset-names.js';

const plotArea = (dv) => {
    const layout = dv.getLayout();

    //draw title
    DrawTitleLabel(dv);
    
    //draw axis 
    layout.hasAxisData? DrawAxis(dv): null;
    
     //draw arc
    layout.hasPieData? DrawArc(dv): null;
};

export default plotArea;