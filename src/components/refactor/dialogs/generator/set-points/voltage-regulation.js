/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import SelectInput from '../../../rhf-inputs/select-input';
import { REGULATION_TYPES } from '../../../../network/constants';
import {
    Q_PERCENT,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from '../../../utils/field-constants';
import React, { useEffect } from 'react';
import FloatInput from '../../../rhf-inputs/float-input';
import {
    gridItem,
    italicFontTextField,
    percentageTextField,
    VoltageAdornment,
} from '../../../../dialogs/dialogUtils';
import RegulatingTerminalForm from '../../regulating-terminal/regulating-terminal-form';
import { Box } from '@mui/system';
import Grid from '@mui/material/Grid';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFormContext, useWatch } from 'react-hook-form';

const VoltageRegulation = ({
    studyUuid,
    currentNodeUuid,
    voltageLevelOptions,
    generatorInfos,
}) => {
    const intl = useIntl();
    const { setValue } = useFormContext();
    function getPreviousRegulationType(generatorInfos) {
        if (generatorInfos?.voltageRegulatorOn) {
            return generatorInfos?.regulatingTerminalVlId ||
                generatorInfos?.regulatingTerminalConnectableId
                ? REGULATION_TYPES.DISTANT
                : REGULATION_TYPES.LOCAL;
        } else {
            return null;
        }
    }
    const previousRegulationTypeLabel = getPreviousRegulationType(
        generatorInfos
    )?.label
        ? intl.formatMessage({
              id: getPreviousRegulationType(generatorInfos)?.label,
          })
        : undefined;

    const voltageRegulationType = useWatch({
        name: VOLTAGE_REGULATION_TYPE,
    });

    useEffect(() => {
        if (
            generatorInfos?.regulatingTerminalVlId ||
            generatorInfos?.regulatingTerminalConnectableId
        ) {
            setValue(VOLTAGE_REGULATION_TYPE, REGULATION_TYPES.DISTANT.id);
        }
    }, [generatorInfos, setValue]);

    const isDistantRegulation =
        typeof voltageRegulationType === 'object'
            ? voltageRegulationType?.id === REGULATION_TYPES.DISTANT.id
            : voltageRegulationType === REGULATION_TYPES.DISTANT.id;

    const voltageRegulationTypeField = (
        <SelectInput
            options={Object.values(REGULATION_TYPES)}
            name={VOLTAGE_REGULATION_TYPE}
            label={'RegulationTypeText'}
            size={'small'}
            disableClearable={true}
            formProps={italicFontTextField}
            previousValue={previousRegulationTypeLabel}
        />
    );

    const voltageSetPointField = (
        <FloatInput
            name={VOLTAGE_SET_POINT}
            label={'VoltageText'}
            adornment={VoltageAdornment}
            previousValue={generatorInfos?.targetV}
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
            previousRegulatingTerminalValue={
                generatorInfos?.regulatingTerminalVlId
            }
            previousEquipmentSectionTypeValue={
                generatorInfos?.regulatingTerminalConnectableType
                    ? generatorInfos?.regulatingTerminalConnectableType +
                      ' : ' +
                      generatorInfos?.regulatingTerminalConnectableId
                    : null
            }
        />
    );

    const qPercentField = (
        <FloatInput
            name={Q_PERCENT}
            label={'QPercentText'}
            adornment={percentageTextField}
            previousValue={generatorInfos?.qPercent}
        />
    );

    return (
        <>
            {gridItem(voltageRegulationTypeField, 4)}
            <Box sx={{ width: '100%' }} />
            <Grid item xs={4} justifySelf={'end'} />
            {gridItem(voltageSetPointField, 4)}
            <Box sx={{ width: '100%' }} />
            {isDistantRegulation && (
                <>
                    <Grid item xs={4} justifySelf={'end'}>
                        <FormattedMessage id="RegulatingTerminalGenerator" />
                    </Grid>
                    {gridItem(regulatingTerminalField, 8)}
                    <Grid item xs={4} justifySelf={'end'} />
                    {gridItem(qPercentField, 4)}
                </>
            )}
        </>
    );
};

export default VoltageRegulation;
