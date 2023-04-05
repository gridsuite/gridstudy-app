/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ExpandableInput from 'components/refactor/rhf-inputs/expandable-input';
import {
    BUS_BAR_COUNT,
    BUS_BAR_SECTIONS_OPTIONS,
    BUS_BAR_SECTION_ID1,
    BUS_BAR_SECTION_ID2,
    COUPLING_OMNIBUS,
    EQUIPMENT_ID,
    SECTION_COUNT,
} from 'components/refactor/utils/field-constants';
import { CouplingOmnibusCreation } from './coupling-omnibus-creation';
import { useEffect, useMemo, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

export const CouplingOmnibusForm = () => {
    const couplingOmnibusCreation = {
        [BUS_BAR_SECTION_ID1]: null,
        [BUS_BAR_SECTION_ID2]: null,
    };

    const voltageLevelID = useWatch({ name: EQUIPMENT_ID });
    const busBarCount = useWatch({ name: BUS_BAR_COUNT });
    const sectionCount = useWatch({ name: SECTION_COUNT });

    const sectionOptions = useMemo(() => {
        const options = [];
        if (voltageLevelID && busBarCount && sectionCount) {
            for (let i = 0; i < sectionCount; i++) {
                for (let j = 0; j < busBarCount; j++) {
                    options.push(
                        voltageLevelID + '_' + (j + 1) + '_' + (i + 1)
                    );
                }
            }
        }
        return options.sort((a, b) => a.localeCompare(b));
    }, [voltageLevelID, busBarCount, sectionCount]);

    const sectionOptionsRef = useRef(sectionOptions);

    const { setValue, getValues } = useFormContext();

    useEffect(() => {
        if (sectionOptionsRef.current !== sectionOptions) {
            setValue(COUPLING_OMNIBUS, []);
        }
        sectionOptionsRef.current = sectionOptions;
        setValue(BUS_BAR_SECTIONS_OPTIONS, sectionOptions);
    }, [
        voltageLevelID,
        busBarCount,
        sectionCount,
        sectionOptions,
        setValue,
        getValues,
    ]);

    return (
        <ExpandableInput
            name={COUPLING_OMNIBUS}
            Field={CouplingOmnibusCreation}
            addButtonLabel={'AddCoupling_Omnibus'}
            initialValue={couplingOmnibusCreation}
        />
    );
};
