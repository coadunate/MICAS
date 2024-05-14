import React, {FunctionComponent} from 'react';
import {Chart} from "react-google-charts";


type IChartData = {
    queries_data: any
}

const ChartComponent : FunctionComponent<IChartData> = ({queries_data}) => {

    console.log(JSON.stringify(queries_data));
    return (
        <div className="container">
            <Chart
                    height={"300px"}
                    chartType="BarChart"
                    loader={<div>Loading Chart</div>}
                    data={queries_data}
                    options={{
                        chartArea: {width: "50%"},
                        hAxis    : {
                            title   : "Match Ratio",
                            minValue: 0
                        },
                        vAxis    : {
                            title: "Alert Sequences"
                        }
                    }}
                />
        </div>
    );

}

export default React.memo(
    ChartComponent,
    (prevProps, nextProps) => JSON.stringify(prevProps.queries_data) === JSON.stringify(nextProps.queries_data)
);