/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { AutocompleteInput, Option } from '@gridsuite/commons-ui';
import { areIdsEqual, getObjectId } from '../../../utils/utils';
import { getConnectivityVoltageLevelData } from "../../connectivity/connectivity-form-utils";

type FeederBayTargetBusbarIdCellRendererProps = {
    name: string;
    value: Option;
    busBarSectionIds: Option[];
};

export default function FeederBayTargetBusbarIdCellRenderer({
    name,
    value,
    busBarSectionIds,
}: Readonly<FeederBayTargetBusbarIdCellRendererProps>) {
    return (
        <div>
            <AutocompleteInput
                name={name}
                value={value}
                options={busBarSectionIds}
                size="small"
                clearable={true}
                isOptionEqualToValue={areIdsEqual}
                getOptionLabel={getObjectId}
            />
        </div>
    );
}
