/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AutocompleteInput } from '@gridsuite/commons-ui';
import { BUS_BAR_SECTION_ID1, BUS_BAR_SECTION_ID2 } from 'components/utils/field-constants';
import GridItem from '../../commons/grid-item.js';
import {getObjectId} from "../../../utils/utils.js";

export const CouplingDeviceForm = ({ index, sectionOptions }) => {
    console.log('toto', sectionOptions);
    const busBarSectionId1Field = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={`${BUS_BAR_SECTION_ID1}`}
            label="BusBarSectionID1"
            options={sectionOptions ?? []}
            getOptionLabel={getObjectId}
            size={'small'}
        />
    );
    const busBarSectionId2Field = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={`${BUS_BAR_SECTION_ID2}`}
            label="BusBarSectionID2"
            options={sectionOptions ?? []}
            getOptionLabel={getObjectId}
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
