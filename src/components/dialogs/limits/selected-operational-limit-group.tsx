/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Box } from '@mui/material';
import { SelectInput } from '@gridsuite/commons-ui';
import { Option } from '@gridsuite/commons-ui/dist/utils/types/types';
import { LimitSet } from '../network-modifications/line/creation/load-creation-type';

export interface SelectedOperationalLimitGroupProps {
    selectedFormName: string;
    optionsFormName: string;
}

export const SelectedOperationalLimitGroup = ({
    selectedFormName,
    optionsFormName,// TODO : passer direct le tableau en props ?
}: Readonly<SelectedOperationalLimitGroupProps>) => {
    const [limitSets, setLimitSets] = useState<Option[]>([]);

    const optionsValues: LimitSet[] = useWatch({
        name: optionsFormName,
    });

    useEffect(() => { // TODO : faire un genre de affectation useMemo ici ?
        if (optionsValues.length > 0) {
            let allLimitSets: Option[] = [];
            optionsValues.forEach((optionObj: LimitSet) => {
                const option: Option = {
                    id: optionObj.id,
                    label: '',
                };
                allLimitSets.push(option);
            });
            setLimitSets(allLimitSets);
        }
    }, [optionsValues]);

    return (
        <Box sx={{ maxWidth: 300 }}>
            <SelectInput
                name={selectedFormName}
                options={limitSets}
                label={'SelectedOperationalLimitGroup'}
                size={'small'}
            />
        </Box>
    );
};
