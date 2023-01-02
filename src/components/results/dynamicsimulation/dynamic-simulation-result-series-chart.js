/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    blue,
    cyan,
    green,
    orange,
    pink,
    purple,
    red,
} from '@mui/material/colors';
import { memo } from 'react';

const baseColors = [red, orange, blue, green, purple, pink, cyan];

const DynamicSimulationResultSeriesChart = ({ series }) => {
    return (
        <ResponsiveContainer width={'100%'} height={600}>
            <LineChart width={500} height={300}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="category"
                    type="category"
                    allowDuplicatedCategory={false}
                />
                <YAxis dataKey="value" />
                <Tooltip />
                <Legend />
                {series.map((s) => (
                    <Line
                        dataKey="value"
                        data={s.data}
                        name={s.name}
                        key={s.index}
                        stroke={baseColors[s.index % baseColors.length]['500']}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default memo(DynamicSimulationResultSeriesChart);
