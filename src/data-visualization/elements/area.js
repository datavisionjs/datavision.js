import * as Calc from '../helpers/math.js'


const fillArea = (
    dv, ctx, isStacked, isPercent, datasetIndex, 
    label, labels, axisNames, stackLastValues,
    color, loopRange, dataPoints, stackSums
) => {

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.2;

    const [labelAxisName, valueAxisName] = axisNames;
    const [loopStart, loopEnd] = loopRange;
    
    if(datasetIndex === 0 || !isStacked){
        const zeroStartPos = Calc.getAxisPosition(dv, label, 0, valueAxisName, labelAxisName);
        const zeroEndPos = Calc.getAxisPosition(dv, labels[loopStart], 0, valueAxisName, labelAxisName);
                                    
        if(zeroStartPos && zeroEndPos){
            ctx.lineTo(zeroStartPos.x, zeroStartPos.y);
            ctx.lineTo(zeroEndPos.x, zeroEndPos.y);
            ctx.closePath();
            ctx.fill();
        }
    }else {
                                    
        for(var o = (loopEnd-1); o >= loopStart; o--){
            const label = labels[o];
            let value = dataPoints.get(label);
    
            const stackValue = stackLastValues.get(label);
    
            const range = stackSums.get(label) || 0;//(keyMinMax.max - keyMinMax.min);
            value = isPercent ? (value / range) * 100 : value;
    
            const prevStackValue = (stackValue - value);
    
            const prevPointsPos = Calc.getAxisPosition(dv, label, prevStackValue, valueAxisName, labelAxisName);
            ctx.lineTo(prevPointsPos.x, prevPointsPos.y);
        }
    
        ctx.closePath();
        ctx.fill();
    }
    
}

export default fillArea;