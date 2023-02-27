/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { gridItem } from 'components/dialogs/dialogUtils';
import {
    BUS_BAR_SECTIONS,
    FROM_BBS,
    ID,
    SWITCH_KIND,
    TO_BBS,
} from 'components/refactor/utils/field-constants';
import AutocompleteInput from 'components/refactor/rhf-inputs/autocomplete-input';
import { SWITCH_TYPE } from 'components/network/constants';
import SelectInput from 'components/refactor/rhf-inputs/select-input';
import { useWatch } from 'react-hook-form';
import { useEffect, useState } from 'react';

export const Connectivity = ({ id, index }) => {
    const [busBarSections, setbusBarSections] = useState([]);

    const watchBusBarSections = useWatch({
        name: `${BUS_BAR_SECTIONS}`,
    });

    useEffect(() => {
        if (watchBusBarSections) {
            setbusBarSections(
                watchBusBarSections?.map(
                    (busBarSection) => busBarSection[ID]
                ) ?? []
            );
        }
    }, [watchBusBarSections, setbusBarSections]);

    const fromBBSField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={`${id}.${index}.${FROM_BBS}`}
            label="BusBarSection"
            options={busBarSections}
            size={'small'}
        />
    );

    const toBBSField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={`${id}.${index}.${TO_BBS}`}
            label="BusBarSection"
            options={busBarSections}
            size={'small'}
        />
    );

    const switchKindField = (
        <SelectInput
            name={`${id}.${index}.${SWITCH_KIND}`}
            label={'Type'}
            options={Object.values(SWITCH_TYPE)}
            fullWidth
            disableClearable={true}
            size={'small'}
        />
    );

    return (
        <>
            {gridItem(fromBBSField, 3)}
            {gridItem(toBBSField, 3)}
            {gridItem(switchKindField, 3)}
        </>
    );
};
