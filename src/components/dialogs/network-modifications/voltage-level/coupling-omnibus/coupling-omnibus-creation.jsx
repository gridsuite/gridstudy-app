/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AutocompleteInput } from '@gridsuite/commons-ui';
import { BUS_BAR_SECTION_ID1, BUS_BAR_SECTION_ID2, COUPLING_OMNIBUS } from 'components/utils/field-constants';
import GridItem from '../../../commons/grid-item';

// TODO should use "name" props instead of `${COUPLING_OMNIBUS}.(...)`
export const CouplingOmnibusCreation = ({ index, sectionOptions }) => {
    const busBarSectionId1Field = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={`${COUPLING_OMNIBUS}.${index}.${BUS_BAR_SECTION_ID1}`}
            label="SectionID1"
            options={sectionOptions ?? []}
            size={'small'}
        />
    );
    const busBarSectionId2Field = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={`${COUPLING_OMNIBUS}.${index}.${BUS_BAR_SECTION_ID2}`}
            label="SectionID2"
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
