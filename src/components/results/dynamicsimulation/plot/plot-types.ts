/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Layout } from 'react-grid-layout';

export type Series = {
    index: number;
    name: string;
    data: {
        x?: number[];
        y?: number[];
    };
};

export type Plot = {
    id: string;
    leftSelectedSeries: Series[] | undefined;
    rightSelectedSeries: Series[] | undefined;
};

export type GridLayout = {
    items: Layout[];
    numColumns: number;
};
