/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { gridItem } from 'components/dialogs/dialogUtils';
import IntegerInput from 'components/refactor/rhf-inputs/integer-input';
import TextInput from 'components/refactor/rhf-inputs/text-input';
import {
    BUS_BAR_SECTIONS,
    HORIZONTAL_POSITION,
    ID,
    NAME,
    VERTICAL_POSITION,
} from 'components/refactor/utils/field-constants';

export const numericalWithButton = {
    type: 'number',
    inputProps: { min: 0, style: { textAlign: 'right' } },
};

export const BusBarSectionCreation = ({ index }) => {
    const equipmentIdField = (
        <TextInput
            name={`${BUS_BAR_SECTIONS}.${index}.${ID}`}
            label={'BusBarSectionID'}
        />
    );
    const equipmentNameField = (
        <TextInput
            name={`${BUS_BAR_SECTIONS}.${index}.${NAME}`}
            label={'Name'}
        />
    );

    const horizontalPositionField = (
        <IntegerInput
            name={`${BUS_BAR_SECTIONS}.${index}.${HORIZONTAL_POSITION}`}
            label="BusBarHorizPos"
            formProps={{
                ...numericalWithButton,
            }}
            acceptValue={(value) => Number.isInteger(parseInt(value))}
        />
    );

    const verticalPositionField = (
        <IntegerInput
            name={`${BUS_BAR_SECTIONS}.${index}.${VERTICAL_POSITION}`}
            label="BusBarVertPos"
            formProps={{
                ...numericalWithButton,
            }}
            acceptValue={(value) => Number.isInteger(parseInt(value))}
        />
    );

    return (
        <>
            {gridItem(equipmentIdField, 2.5)}
            {gridItem(equipmentNameField, 2.5)}
            {gridItem(horizontalPositionField, 2.5)}
            {gridItem(verticalPositionField, 2.5)}
        </>
    );
};
