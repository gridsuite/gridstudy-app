/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
    EquipmentType,
    FieldConstants,
    VoltageLevelCreationForm,
} from '@gridsuite/commons-ui';
import { Box, Paper } from '@mui/material';

import { fetchEquipmentsIds } from '../../../../../services/study/network-map';
import { useFormContext } from 'react-hook-form';
import IconButton from '@mui/material/IconButton';
import { useIntl } from 'react-intl';
import LineSeparator from '../../../commons/line-separator';
import { UUID } from 'node:crypto';

interface StudyVoltageLevelCreationFormProps {
    currentNodeUuid: UUID;
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
}

const StudyVoltageLevelCreationForm = ({
    currentNodeUuid,
    studyUuid,
    currentRootNetworkUuid,
}: StudyVoltageLevelCreationFormProps) => {
    const intl = useIntl();
    const { setValue, getValues } = useFormContext();
    const [substations, setSubstations] = useState<string[]>([]);

    useEffect(() => {
        if (studyUuid && currentNodeUuid && currentRootNetworkUuid) {
            fetchEquipmentsIds(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                undefined,
                EquipmentType.SUBSTATION,
                true
            ).then((values: string[]) => {
                setSubstations(values.sort((a, b) => a.localeCompare(b)));
            });
        }
    }, [studyUuid, currentNodeUuid, currentRootNetworkUuid]);

    const handleAddButton = useCallback(() => {
        setValue(FieldConstants.SUBSTATION_CREATION_ID, getValues(FieldConstants.SUBSTATION_ID));
        setValue(FieldConstants.ADD_SUBSTATION_CREATION, true);
    }, [setValue, getValues]);

    function getCustomPaper(children: React.ReactNode) {
        return (
            <Paper>
                <Box>
                    {children}
                    <LineSeparator />
                    <IconButton
                        color="primary"
                        sx={{ justifyContent: 'flex-start', fontSize: 'medium', marginLeft: '2%', width: '100%' }}
                        onMouseDown={handleAddButton}
                    >
                        {`${intl.formatMessage({ id: 'CreateSubstation' })} : ${getValues(FieldConstants.SUBSTATION_ID)}`}
                    </IconButton>
                </Box>
            </Paper>
        );
    }

    return (
        <VoltageLevelCreationForm
            substationOptions={substations}
            substationFieldAdditionalProps={{
                PaperComponent: ({ children }: { children: React.ReactNode }) => getCustomPaper(children),
                noOptionsText: '',
            }}
        />
    );
};

export default StudyVoltageLevelCreationForm;
