//import helpers
import * as Prop from '../helpers/properties.js'

import AddTitle from './title.js';

import DrawAxis from "./axis";
import DrawTable from './table.js';

const plotArea = (dv) => {
    const layout = dv.getLayout();
    
    //draw axis 
    layout.hasAxisData? DrawAxis(dv): null;

    //draw table
    layout.hasTableData? DrawTable(dv): null;

    //draw title
    AddTitle(dv);
};

export default plotArea;