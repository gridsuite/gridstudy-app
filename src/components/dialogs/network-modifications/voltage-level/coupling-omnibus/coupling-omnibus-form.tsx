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
import { useFormContext } from 'react-hook-form';
import { ExpandableInput } from '@gridsuite/commons-ui';
import { fetchBusBarSectionsForNewCoupler } from '../../../../../services/network-modification';

export const CouplingOmnibusForm = () => {
    const { setValue } = useFormContext();

    const couplingOmnibusCreation = {
        [BUS_BAR_SECTION_ID1]: null,
        [BUS_BAR_SECTION_ID2]: null,
    };

    const [sectionOptions, setSectionOptions] = useState<string[]>([]);

    const { subscribe, trigger, getValues, formState } = useFormContext();

    useEffect(() => {
        const switchKinds: string[] = getValues(SWITCH_KINDS).map((value: { switchKind: string }) => value.switchKind);
        fetchBusBarSectionsForNewCoupler(
            getValues(EQUIPMENT_ID),
            getValues(BUS_BAR_COUNT),
            getValues(SECTION_COUNT),
            switchKinds
        ).then((bbsIds) => {
            setSectionOptions(bbsIds);
        });
    }, [getValues]);

    useEffect(() => {
        const unsubscribe = subscribe({
            name: [EQUIPMENT_ID, BUS_BAR_COUNT, SECTION_COUNT, SWITCH_KINDS],
            formState: {
                values: true,
            },
            callback: () => {
                const switchKinds: string[] = getValues(SWITCH_KINDS).map(
                    (value: { switchKind: string }) => value.switchKind
                );
                fetchBusBarSectionsForNewCoupler(
                    getValues(EQUIPMENT_ID),
                    getValues(BUS_BAR_COUNT),
                    getValues(SECTION_COUNT),
                    switchKinds
                ).then((bbsIds) => {
                    setValue(COUPLING_OMNIBUS, []);
                    setSectionOptions(bbsIds);
                });
            },
        });
        return () => unsubscribe();
    }, [subscribe, trigger, getValues, setValue, formState]);

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
