/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput, Identifiable, SelectInput } from '@gridsuite/commons-ui';
import { REGULATION_TYPES } from 'components/network/constants';
import { Q_PERCENT, VOLTAGE_REGULATION_TYPE, VOLTAGE_SET_POINT } from 'components/utils/field-constants';
import { useMemo } from 'react';
import { percentageTextField, VoltageAdornment } from '../dialog-utils';
import { RegulatingTerminalForm } from '../regulating-terminal/regulating-terminal-form';
import { Box, Grid } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useWatch } from 'react-hook-form';
import GridItem from '../commons/grid-item';
import { UUID } from 'crypto';

interface VoltageRegulationFormProps {
    studyUuid: UUID;
    currentNodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    voltageLevelOptions: Identifiable[];
    previousValues?: {
        regulatingTerminalConnectableId?: string | null;
        regulatingTerminalVlId?: string | null;
        regulatingTerminalConnectableType?: string | null;
        voltageSetPoint?: number | null;
        qPercent?: number | null;
    };
    isEquipmentModification?: boolean;
}
export function VoltageRegulationForm({
    studyUuid,
    currentNodeUuid,
    currentRootNetworkUuid,
    voltageLevelOptions,
    previousValues,
    isEquipmentModification,
}: Readonly<VoltageRegulationFormProps>) {
    const intl = useIntl();
    const previousRegulationType = useMemo(() => {
        if (previousValues?.regulatingTerminalVlId || previousValues?.regulatingTerminalConnectableId) {
            return REGULATION_TYPES.DISTANT.id;
        } else {
            return REGULATION_TYPES.LOCAL.id;
        }
    }, [previousValues]);

    const voltageRegulationType = useWatch({
        name: VOLTAGE_REGULATION_TYPE,
    });

    const translatedPreviousRegulationLabel = useMemo(() => {
        if (isEquipmentModification && REGULATION_TYPES[previousRegulationType]) {
            return intl.formatMessage({
                id: REGULATION_TYPES[previousRegulationType].label,
            });
        }
        return null;
    }, [intl, isEquipmentModification, previousRegulationType]);

    const isDistantRegulation = useMemo(() => {
        return (
            voltageRegulationType === REGULATION_TYPES.DISTANT.id ||
            (!voltageRegulationType && previousRegulationType === REGULATION_TYPES.DISTANT.id)
        );
    }, [previousRegulationType, voltageRegulationType]);

    const voltageRegulationTypeField = (
        <SelectInput
            options={Object.values(REGULATION_TYPES)}
            name={VOLTAGE_REGULATION_TYPE}
            label={'RegulationTypeText'}
            size={'small'}
            previousValue={translatedPreviousRegulationLabel ?? undefined}
        />
    );

    const voltageSetPointField = (
        <FloatInput
            name={VOLTAGE_SET_POINT}
            label={'VoltageText'}
            adornment={VoltageAdornment}
            previousValue={previousValues?.voltageSetPoint ?? undefined}
            clearable={true}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={''}
            voltageLevelOptions={voltageLevelOptions}
            equipmentSectionTypeDefaultValue={''}
            currentNodeUuid={currentNodeUuid}
            currentRootNetworkUuid={currentRootNetworkUuid}
            studyUuid={studyUuid}
            regulatingTerminalVlId={previousValues?.regulatingTerminalVlId ?? undefined}
            equipmentSectionType={
                previousValues?.regulatingTerminalConnectableType
                    ? previousValues?.regulatingTerminalConnectableType +
                      ' : ' +
                      previousValues?.regulatingTerminalConnectableId
                    : undefined
            }
        />
    );

    const qPercentField = (
        <FloatInput
            name={Q_PERCENT}
            label={'QPercentText'}
            adornment={percentageTextField}
            previousValue={previousValues?.qPercent ?? undefined}
            clearable={true}
        />
    );

    return (
        <>
            <GridItem size={4}>{voltageSetPointField}</GridItem>
            <GridItem size={4}>{voltageRegulationTypeField}</GridItem>
            <Box sx={{ width: '100%' }} />
            <Grid item xs={4} justifySelf={'end'} />

            <Box sx={{ width: '100%' }} />
            {isDistantRegulation && (
                <>
                    <Grid item xs={4} justifySelf={'end'}>
                        <FormattedMessage id="RegulatingTerminalGenerator" />
                    </Grid>
                    <GridItem size={8}>{regulatingTerminalField}</GridItem>
                    <Grid item xs={4} justifySelf={'end'} />
                    <GridItem size={4}>{qPercentField}</GridItem>
                </>
            )}
        </>
    );
}
