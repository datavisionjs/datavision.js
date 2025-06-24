import * as Calc from '../helpers/math.js';
import * as Scroll from './scrollbar.js';

const DrawTable = (dv) => {

    const canvasSize = dv.getCanvasSize();
    const canvasWidth = canvasSize.width, canvasHeight = canvasSize.height;
    
    //clear axis area
    dv.clearCanvas(0, 0, canvasWidth, canvasHeight);
    

    //set scroll content width and height
    Scroll.setContentSize(dv);
}

export default DrawTable;