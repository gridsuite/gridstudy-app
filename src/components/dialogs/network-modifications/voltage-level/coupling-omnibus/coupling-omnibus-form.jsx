/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ExpandableInput } from 'components/utils/rhf-inputs/expandable-input';
import {
    BUS_BAR_COUNT,
    BUS_BAR_SECTION_ID1,
    BUS_BAR_SECTION_ID2,
    COUPLING_OMNIBUS,
    EQUIPMENT_ID,
    SECTION_COUNT,
} from 'components/utils/field-constants';
import { CouplingOmnibusCreation } from './coupling-omnibus-creation';
import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { buildNewBusbarSections } from 'components/utils/utils';

export const CouplingOmnibusForm = () => {
    const { setValue } = useFormContext();

    const couplingOmnibusCreation = {
        [BUS_BAR_SECTION_ID1]: null,
        [BUS_BAR_SECTION_ID2]: null,
    };

    const watchVoltageLevelID = useWatch({ name: EQUIPMENT_ID });
    const watchBusBarCount = useWatch({ name: BUS_BAR_COUNT });
    const watchSectionCount = useWatch({ name: SECTION_COUNT });

    const sectionOptions = useMemo(() => {
        if (watchVoltageLevelID && watchBusBarCount && watchSectionCount) {
            return buildNewBusbarSections(watchVoltageLevelID, watchSectionCount, watchBusBarCount).map((section) => {
                return section.id;
            });
        }
        return [];
    }, [watchVoltageLevelID, watchBusBarCount, watchSectionCount]);

    useEffect(() => {
        // the cleanup function is triggered every time sectionOptions changes and when unmounting
        return () => setValue(COUPLING_OMNIBUS, []);
    }, [sectionOptions, setValue]);

    return (
        <ExpandableInput
            name={COUPLING_OMNIBUS}
            Field={CouplingOmnibusCreation}
            fieldProps={{ sectionOptions }}
            addButtonLabel={'AddCoupling_Omnibus'}
            initialValue={couplingOmnibusCreation}
        />
    );
};
