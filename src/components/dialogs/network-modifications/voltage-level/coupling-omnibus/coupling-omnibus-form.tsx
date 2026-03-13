/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    BUS_BAR_COUNT,
    BUS_BAR_SECTION_ID1,
    BUS_BAR_SECTION_ID2,
    COUPLING_OMNIBUS,
    EQUIPMENT_ID,
    SECTION_COUNT,
    SWITCH_KINDS,
} from 'components/utils/field-constants';
import { CouplingOmnibusCreation } from './coupling-omnibus-creation';
import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ExpandableInput } from '@gridsuite/commons-ui';
import { fetchBusBarSectionsForNewCoupler } from '../../../../../services/network-modification';

export const CouplingOmnibusForm = () => {
    const { setValue } = useFormContext();

    const couplingOmnibusCreation = {
        [BUS_BAR_SECTION_ID1]: null,
        [BUS_BAR_SECTION_ID2]: null,
    };

    const [sectionOptions, setSectionOptions] = useState<string[]>([]);

    const watchVoltageLevelID = useWatch({ name: EQUIPMENT_ID });
    const watchBusBarCount = useWatch({ name: BUS_BAR_COUNT });
    const watchSectionCount = useWatch({ name: SECTION_COUNT });
    const watchSwitchesKind = useWatch({ name: SWITCH_KINDS });

    useEffect(() => {
        const switchKinds: string[] = watchSwitchesKind.map((value: { switchKind: string }) => value.switchKind);
        fetchBusBarSectionsForNewCoupler(watchVoltageLevelID, watchBusBarCount, watchSectionCount, switchKinds).then(
            (bbsIds) => {
                setSectionOptions(bbsIds);
            }
        );
    }, [watchVoltageLevelID, watchBusBarCount, watchSectionCount, watchSwitchesKind]);

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
