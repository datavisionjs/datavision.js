import * as Global from '../helpers/global.js';

import AxisChart from './axis-chart.js';
import PieChart from './pie-chart.js';
import TableChart from './table-chart.js';


const Chart = (dv) => {
    const ctx = dv.getCtx();
    const data = dv.getData();

    const layout = dv.getLayout();
    const axisData = layout.axisData;

    for(let i  = 0; i < data.length; i++){

        const dataset = data[i];
        const type = dataset.type;

        if(type){
            const axisChartTypes = Global.getAxisChartTypes();
            if(axisChartTypes.includes(type)){

                const valueAxisName = dataset.yAxis? dataset.yAxis: "y1";
                const yAxis = axisData.values[valueAxisName];

                //reset dataset name
                if(type === "bar"){
                    const barDataset = dataset.dataset || {};
                    barDataset.length === 1? barDataset[0].name = yAxis.title: null;
                }else {
                    //
                    data.length === 1? dataset.name = yAxis.title: null;
                }

                AxisChart(dv, dataset);

            }else if(type === "pie"){

                PieChart(dv, dataset);
            }else if(type === "table") {

                TableChart(dv, dataset);
            }
        }

    }

}

export default Chart;