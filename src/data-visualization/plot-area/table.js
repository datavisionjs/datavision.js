import * as Calc from '../helpers/math.js';
import * as Scroll from './scrollbar.js';

const DrawTable = (dv) => {

    const ctx = dv.getCtx();
    const layout = dv.getLayout();
    
    const scrollData = dv.getScrollData();

    const design = dv.getDesign();
    const font = design.font;
    const fontSize = font.size;

    const canvasSize = dv.getCanvasSize();
    const canvasWidth = canvasSize.width, canvasHeight = canvasSize.height;

    const graphPosition = layout.graphPosition;
    const graphX = graphPosition.x, graphY = graphPosition.y;
    const graphWidth = graphPosition.width, graphHeight = graphPosition.height;

    const tableData = layout.tableData;

    const header = tableData.header;
    const data = tableData.data;

    const headerLine = header.line || {};
    const dataLine = data.line || {};

    const headerLineWidth = headerLine.width || 1;
    const dataLineWidth = dataLine.width || 1;

    const columnWidth = tableData.columnWidth || [];
    const columnWidthSum = Calc.sum(columnWidth);

    const columnCount = tableData.columnCount;
    const rowCount = tableData.rowCount;

    const headerFont = header.font? header.font: {};
    const thFontSize = headerFont.fontSize? headerFont.fontSize: fontSize;
    const thRowHeight = (thFontSize+fontSize);

    const dataFont = data.font? data.font: {};
    const tdFontSize = dataFont.fontSize? dataFont.fontSize: fontSize;
    const tdRowHeight = (tdFontSize+fontSize);

    
    const topIndex = (scrollData.topIndex || 0), leftIndex = (scrollData.leftIndex || 0);
    let rowTop = ((topIndex/(rowCount))*scrollData.contentHeight) || 0, rowLeft = graphX;
    
    const tableWidth = (graphWidth-graphX);
    //                   
    const tableHeight = (thRowHeight+(tdRowHeight*(rowCount-1))-rowTop);

    const position = {x: 0, y: graphY, width: (graphWidth), height: (canvasHeight-graphY)};


    //clear axis area
    ctx.clearRect(0, graphY, canvasWidth, canvasHeight);
    

    //set scroll content width and height
    Scroll.setContentSize(dv);

    //add axis scroll bar
    Scroll.addBars(dv, position);
}

export default DrawTable;