/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import {
    CURRENT_LIMITER_REGULATING_VALUE,
    ENABLED,
    FLOW_SET_POINT_REGULATING_VALUE,
    PHASE_TAP_CHANGER,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    TARGET_DEADBAND,
} from 'components/utils/field-constants';
import { useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import {
    ActivePowerAdornment,
    AmpereAdornment,
    gridItem,
} from '../../../dialogUtils';
import {
    PHASE_REGULATION_MODES,
    REGULATION_TYPES,
    SIDE,
} from '../../../../network/constants';
import FloatInput from '../../../../utils/rhf-inputs/float-input';
import SelectInput from '../../../../utils/rhf-inputs/select-input';
import RegulatingTerminalForm from '../../../regulating-terminal/regulating-terminal-form';
import PhaseTapChangerPaneSteps from './phase-tap-changer-pane-steps';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';

const PhaseTapChangerPane = ({
    id = PHASE_TAP_CHANGER,
    studyUuid,
    currentNodeUuid,
    voltageLevelOptions = [],
}) => {
    const phaseTapChangerEnabledWatch = useWatch({
        name: `${id}.${ENABLED}`,
    });

    const regulationModeWatch = useWatch({
        name: `${id}.${REGULATION_MODE}`,
    });

    const regulationTypeWatch = useWatch({
        name: `${id}.${REGULATION_TYPE}`,
    });

    const regulationEnabled =
        phaseTapChangerEnabledWatch &&
        (regulationModeWatch === PHASE_REGULATION_MODES.CURRENT_LIMITER.id ||
            regulationModeWatch ===
                PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id);

    const regulationModeField = (
        <SelectInput
            name={`${id}.${REGULATION_MODE}`}
            label={'RegulationMode'}
            options={Object.values(PHASE_REGULATION_MODES)}
            disabled={!phaseTapChangerEnabledWatch}
        />
    );

    const regulationTypeField = (
        <SelectInput
            name={`${id}.${REGULATION_TYPE}`}
            label={'RegulationTypeText'}
            options={Object.values(REGULATION_TYPES)}
            disabled={!regulationEnabled}
            size={'small'}
            disableClearable
        />
    );

    const sideField = (
        <SelectInput
            name={`${id}.${REGULATION_SIDE}`}
            label={'RegulatedSide'}
            options={Object.values(SIDE)}
            disabled={!regulationEnabled}
            size={'small'}
            disableClearable
        />
    );

    const currentLimiterRegulatingValueField = (
        <FloatInput
            name={`${id}.${CURRENT_LIMITER_REGULATING_VALUE}`}
            label="RegulatingValueCurrentLimiter"
            formProps={{
                disabled: !regulationEnabled,
            }}
            adornment={AmpereAdornment}
        />
    );

    const flowSetPointRegulatingValueField = (
        <FloatInput
            name={`${id}.${FLOW_SET_POINT_REGULATING_VALUE}`}
            label="RegulatingValueActivePowerControl"
            adornment={ActivePowerAdornment}
            formProps={{
                disabled: !regulationEnabled,
            }}
        />
    );

    const targetDeadbandField = (
        <FloatInput
            name={`${id}.${TARGET_DEADBAND}`}
            label="Deadband"
            adornment={ActivePowerAdornment}
            formProps={{
                disabled: !regulationEnabled,
            }}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={id}
            disabled={!regulationEnabled}
            equipmentSectionTypeDefaultValue={
                EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type
            }
            studyUuid={studyUuid}
            currentNodeUuid={currentNodeUuid}
            voltageLevelOptions={voltageLevelOptions}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <Grid item container spacing={2}>
                    <Grid item xs={4}>
                        {regulationModeField}
                    </Grid>
                </Grid>
                {regulationEnabled && (
                    <Grid item container spacing={2}>
                        <Grid item xs={4}>
                            {regulationTypeField}
                        </Grid>
                        <Grid item xs={4}>
                            {regulationModeWatch ===
                                PHASE_REGULATION_MODES.CURRENT_LIMITER.id &&
                                currentLimiterRegulatingValueField}
                            {regulationModeWatch ===
                                PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL
                                    .id && flowSetPointRegulatingValueField}
                        </Grid>
                        <Grid item xs={4}>
                            {targetDeadbandField}
                        </Grid>
                    </Grid>
                )}
                {regulationEnabled &&
                    regulationTypeWatch === REGULATION_TYPES.DISTANT.id && (
                        <Grid item container spacing={2}>
                            <Grid
                                item
                                xs={4}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                }}
                            >
                                <FormattedMessage id="DistantRegulatedTerminal" />
                            </Grid>
                            {gridItem(regulatingTerminalField, 8)}
                        </Grid>
                    )}
                {regulationEnabled &&
                    regulationTypeWatch === REGULATION_TYPES.LOCAL.id && (
                        <Grid item container spacing={2}>
                            <Grid
                                item
                                xs={4}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                }}
                            >
                                <FormattedMessage id="RegulatedTerminal" />
                            </Grid>
                            {gridItem(sideField, 4)}
                        </Grid>
                    )}
                <PhaseTapChangerPaneSteps
                    disabled={!phaseTapChangerEnabledWatch}
                />
            </Grid>
        </>
    );
};

export default PhaseTapChangerPane;
