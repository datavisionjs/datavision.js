

//get all of the styling in layout
const Design = (dv, layout) => {
    const canvas = dv.getCanvas();

    //universal 
    const font = layout.font || {};
    const newFont = {
        family: font.family || "Helvetica Neue, Helvetica, 'Arial, sans-serif",
        weight: font.weight || "normal",
        style: font.style || "normal",
        size: font.size || 14,
        color: font.color || "black"
    }

    const grid = layout.grid || {};
    const gridTick0 = grid.tick0 || {};
    const newGrid = {
        width: grid.width || 1.5,
        color: grid.color || "#e7e7e7",
        tick0: {
            width: gridTick0.width || 1,
            color: gridTick0.color || "black",
        }
    }

    //specific
    const title = layout.title || {};
    const titleFont = title.font || {}
    const titleAlign = title.align;

    const titleDesign = {
        font: {
            family: titleFont.family || newFont.family, 
            weight: titleFont.weight || newFont.weight,
            style: titleFont.style || newFont.style,
            size: titleFont.size || 20,
            color: titleFont.color || newFont.color,
        }, 
        align: titleAlign || "center",
    };

    //set getGridTick0
    const newGridTick0 = newGrid.tick0;

    //set xAxis style
    const xAxis = layout.xAxis || {};
    const xAxisGrid = xAxis.grid || {};
    const xAxisGridTick0 = xAxisGrid.tick0 || {};
    const xAxisDesign = {
        font: {
            family: newFont.family, 
            weight: newFont.weight,
            style: newFont.style,
            size: newFont.size,
            color: newFont.color,
        }, 
        grid: {
            width: xAxisGrid.width || newGrid.width,
            color: xAxisGrid.color || newGrid.color,
            tick0: {
                width: xAxisGridTick0.width || newGridTick0.width,
                color: xAxisGridTick0.color || newGridTick0.color,
            }
        }
    }

    //set xAxis style
    const yAxis = layout.yAxis || {};
    const yAxisGrid = yAxis.grid || {};
    const yAxisGridTick0 = yAxisGrid.tick0 || {};
    const yAxisDesign = {
        font: {
            family: newFont.family, 
            weight: newFont.weight,
            style: newFont.style,
            size: newFont.size,
            color: newFont.color,
        },  
        grid: {
            width: yAxisGrid.width || newGrid.width,
            color: yAxisGrid.color || newGrid.color,
            tick0: {
                width: yAxisGridTick0.width || newGridTick0.width,
                color: yAxisGridTick0.color || newGridTick0.color,
            }
        }
    }

    //specific
    const legend = layout.legend || {};
    const legendFont = legend.font || {}

    const newLegendFont = {
        family: legendFont.family || newFont.family, 
        weight: legendFont.weight || newFont.weight,
        style: legendFont.style || newFont.style,
        size: legendFont.size || newFont.size,
        color: legendFont.color || newFont.color, 
    };


    
    return {
        font: newFont,
        title: titleDesign,
        xAxis: xAxisDesign,
        yAxis: yAxisDesign,
        legendFont: newLegendFont
    };

}

export default Design;