/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { gridItem } from 'components/dialogs/dialogUtils';
import {
    BUS_BAR_CONNECTIONS,
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
import { useMemo } from 'react';

export const BusBarSectionConnection = ({ index }) => {
    const watchBusBarSections = useWatch({
        name: `${BUS_BAR_SECTIONS}`,
    });

    const updateBusBarSections = (watchBusBarSections) => {
        if (watchBusBarSections) {
            const filteredBusBarSections = watchBusBarSections.filter(
                (busBarSection) => busBarSection[ID] !== ''
            );
            return filteredBusBarSections.map(
                (busBarSection) => busBarSection[ID]
            );
        }
        return null;
    };

    const busBarSections = useMemo(() => {
        return updateBusBarSections(watchBusBarSections);
    }, [watchBusBarSections]);

    const fromBBSField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={`${BUS_BAR_CONNECTIONS}.${index}.${FROM_BBS}`}
            label="BusBarSection"
            options={busBarSections}
            size={'small'}
        />
    );

    const toBBSField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={`${BUS_BAR_CONNECTIONS}.${index}.${TO_BBS}`}
            label="BusBarSection"
            options={busBarSections}
            size={'small'}
        />
    );

    const switchKindField = (
        <SelectInput
            name={`${BUS_BAR_CONNECTIONS}.${index}.${SWITCH_KIND}`}
            label="SUBSTATION"
            options={Object.values(SWITCH_TYPE)}
            fullWidth
            size={'small'}
            sx={{ fontStyle: 'italic' }}
            disableClearable={true}
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
