/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import React from 'react';
import { BusBarSectionCreation } from './bus-bar-section-creation';
import {
    SWITCH_TYPE,
    VOLTAGE_LEVEL_COMPONENTS,
} from 'components/network/constants';
import { BusBarSectionConnection } from './BusBarSectionConnection';
import {
    BUS_BAR_SECTIONS,
    FROM_BBS,
    HORIZONTAL_POSITION,
    ID,
    NAME,
    SWITCH_KIND,
    TO_BBS,
    VERTICAL_POSITION,
} from 'components/refactor/utils/field-constants';
import ExpandableInput from 'components/refactor/rhf-inputs/expandable-input';

export const BusBarSection = ({ id, type, errors }) => {
    const busBarSectionConnection = {
        [FROM_BBS]: '',
        [TO_BBS]: '',
        [SWITCH_KIND]: SWITCH_TYPE[0].id,
    };
    const busBarSectionCreation = {
        [ID]: '',
        [NAME]: '',
        [HORIZONTAL_POSITION]: 1,
        [VERTICAL_POSITION]: 1,
    };

    return (
        <Grid container spacing={2}>
            {type === VOLTAGE_LEVEL_COMPONENTS.BUS_BAR_SECTION_CREATION ? (
                <ExpandableInput
                    name={BUS_BAR_SECTIONS}
                    Field={BusBarSectionCreation}
                    addButtonLabel={'CreateVariation'}
                    initialValue={busBarSectionCreation}
                    errors={errors}
                />
            ) : (
                <ExpandableInput
                    name={id}
                    Field={BusBarSectionConnection}
                    addButtonLabel={'CreateVariation'}
                    initialValue={busBarSectionConnection}
                    errors={errors}
                />
            )}
        </Grid>
    );
};
