/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ComputingType from '../../computing-status/computing-type';
import type { ReactNode } from 'react';

export interface IService {
    id: string;
    computingType: ComputingType[];
    displayed: boolean;
    renderResult: ReactNode;
}

export interface Filter {
    label: string;
    filterType: string;
    recent?: boolean;
}
