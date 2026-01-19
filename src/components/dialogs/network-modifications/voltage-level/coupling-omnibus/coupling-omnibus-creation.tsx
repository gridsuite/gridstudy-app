/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AutocompleteInput, Option } from '@gridsuite/commons-ui';
import { BUS_BAR_SECTION_ID1, BUS_BAR_SECTION_ID2, COUPLING_OMNIBUS } from 'components/utils/field-constants';
import GridItem from '../../../commons/grid-item';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

interface CouplingOmnibusCreationProps {
    index: number;
    sectionOptions: Option[];
}

// TODO should use "name" props instead of `${COUPLING_OMNIBUS}.(...)`
export const CouplingOmnibusCreation = ({ index, sectionOptions }: CouplingOmnibusCreationProps) => {
    const { getValues, trigger, subscribe } = useFormContext();
    // Watch BUS_BAR_SECTION_ID1 changed
    useEffect(() => {
        const unsubscribe = subscribe({
            name: [`${COUPLING_OMNIBUS}.${index}.${BUS_BAR_SECTION_ID1}`],
            formState: {
                values: true,
            },
            callback: () => {
                // force trigger validation on BUS_BAR_SECTION_ID2 if it has a value
                if (getValues(`${COUPLING_OMNIBUS}.${index}.${BUS_BAR_SECTION_ID2}`)) {
                    trigger(`${COUPLING_OMNIBUS}.${index}.${BUS_BAR_SECTION_ID2}`);
                }
            },
        });
        return () => unsubscribe();
    }, [subscribe, trigger, getValues, index]);

    const busBarSectionId1Field = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={`${COUPLING_OMNIBUS}.${index}.${BUS_BAR_SECTION_ID1}`}
            label="BusBarSectionID1"
            options={sectionOptions ?? []}
            size={'small'}
        />
    );
    const busBarSectionId2Field = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={`${COUPLING_OMNIBUS}.${index}.${BUS_BAR_SECTION_ID2}`}
            label="BusBarSectionID2"
            options={sectionOptions ?? []}
            size={'small'}
        />
    );

    return (
        <>
            <GridItem size={4}>{busBarSectionId1Field}</GridItem>
            <GridItem size={4}>{busBarSectionId2Field}</GridItem>
        </>
    );
};
