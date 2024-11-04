/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput, SelectInput } from '@gridsuite/commons-ui';
import { REGULATION_TYPES } from 'components/network/constants';
import { Q_PERCENT, VOLTAGE_REGULATION_TYPE, VOLTAGE_SET_POINT } from 'components/utils/field-constants';
import { useMemo } from 'react';
import { percentageTextField, VoltageAdornment } from '../dialog-utils';
import RegulatingTerminalForm from '../regulating-terminal/regulating-terminal-form';
import { Box } from '@mui/system';
import { Grid } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useWatch } from 'react-hook-form';
import { GridItem } from '../commons/grid-item';

const VoltageRegulation = ({
    studyUuid,
    currentNodeUuid,
    voltageLevelOptions,
    previousValues,
    isEquipmentModification,
}) => {
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
            previousValue={translatedPreviousRegulationLabel}
        />
    );

    const voltageSetPointField = (
        <FloatInput
            name={VOLTAGE_SET_POINT}
            label={'VoltageText'}
            adornment={VoltageAdornment}
            previousValue={previousValues?.targetV}
            clearable={true}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={''}
            voltageLevelOptions={voltageLevelOptions}
            equipmentSectionTypeDefaultValue={''}
            currentNodeUuid={currentNodeUuid}
            studyUuid={studyUuid}
            previousRegulatingTerminalValue={previousValues?.regulatingTerminalVlId}
            previousEquipmentSectionTypeValue={
                previousValues?.regulatingTerminalConnectableType
                    ? previousValues?.regulatingTerminalConnectableType +
                      ' : ' +
                      previousValues?.regulatingTerminalConnectableId
                    : null
            }
        />
    );

    const qPercentField = (
        <FloatInput
            name={Q_PERCENT}
            label={'QPercentText'}
            adornment={percentageTextField}
            previousValue={!isNaN(previousValues?.qPercent) ? previousValues?.qPercent : null}
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
};

export default VoltageRegulation;
