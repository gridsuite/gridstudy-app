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
import { useWatch, useFormContext } from 'react-hook-form';
import { useCallback, useMemo } from 'react';

export const BusBarSectionConnection = ({ id, index }) => {
    const { setValue } = useFormContext();
    const watchBusBarSections = useWatch({
        name: `${BUS_BAR_SECTIONS}`,
    });

    const updateBusBarSections = (watchBusBarSections) => {
        if (watchBusBarSections) {
            const filteredBusBarSections = watchBusBarSections.filter(
                (busBarSection) =>
                    busBarSection[ID] !== undefined && busBarSection[ID] !== ''
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

    const resetBusBarSectionConnection = useCallback(() => {
        setValue(`${BUS_BAR_CONNECTIONS}.${index}.${FROM_BBS}`, null);
    }, [index, setValue]);

    const fromBBSField = (
        <AutocompleteInput
            forcePopupIcon
            name={`${BUS_BAR_CONNECTIONS}.${index}.${FROM_BBS}`}
            label="BusBarSection"
            options={busBarSections}
            size={'small'}
            onChangeCallback={resetBusBarSectionConnection}
        />
    );

    const toBBSField = (
        <AutocompleteInput
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
            label={'Type'}
            options={Object.values(SWITCH_TYPE)}
            fullWidth
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
