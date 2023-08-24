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
import { FormattedMessage, useIntl } from 'react-intl';
import {
    ActivePowerAdornment,
    AmpereAdornment,
    gridItem,
} from '../../../../dialogUtils';
import {
    PHASE_REGULATION_MODES,
    REGULATION_TYPES,
    SIDE,
} from 'components/network/constants';
import { FloatInput } from '@gridsuite/commons-ui';
import { SelectInput } from '@gridsuite/commons-ui';
import RegulatingTerminalForm from '../../../../regulating-terminal/regulating-terminal-form';
import PhaseTapChangerPaneSteps from './phase-tap-changer-pane-steps';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import {
    getComputedPhaseTapChangerRegulationMode,
    getComputedPreviousPhaseRegulationType,
} from './phase-tap-changer-pane-utils';
import { useMemo } from 'react';
import { getTapChangerEquipmentSectionTypeValue } from 'components/utils/utils';

const PhaseTapChangerPane = ({
    id = PHASE_TAP_CHANGER,
    studyUuid,
    currentNode,
    voltageLevelOptions = [],
    previousValues,
    editData,
    isModification = false,
}) => {
    const intl = useIntl();

    const phaseTapChangerEnabledWatch = useWatch({
        name: `${id}.${ENABLED}`,
    });

    const regulationModeWatch = useWatch({
        name: `${id}.${REGULATION_MODE}`,
    });

    const regulationTypeWatch = useWatch({
        name: `${id}.${REGULATION_TYPE}`,
    });

    const getPhaseTapChangerRegulationModeLabel = (
        phaseTapChangerFormValues
    ) => {
        const computedRegulationMode = getComputedPhaseTapChangerRegulationMode(
            phaseTapChangerFormValues
        );
        if (computedRegulationMode) {
            return intl.formatMessage({
                id: computedRegulationMode?.label,
            });
        }
    };

    const getRegulationTypeLabel = (twt, tap) => {
        if (tap?.regulatingTerminalConnectableId != null) {
            return tap?.regulatingTerminalConnectableId === twt?.id
                ? intl.formatMessage({ id: REGULATION_TYPES.LOCAL.label })
                : intl.formatMessage({ id: REGULATION_TYPES.DISTANT.label });
        } else {
            return null;
        }
    };

    const getTapSideLabel = (twt, tap) => {
        if (!tap || !twt) {
            return null;
        }
        if (tap?.regulatingTerminalConnectableId === twt?.id) {
            return tap?.regulatingTerminalVlId === twt?.voltageLevelId1
                ? intl.formatMessage({ id: SIDE.SIDE1.label })
                : intl.formatMessage({ id: SIDE.SIDE2.label });
        } else {
            return null;
        }
    };

    const getRegulatingPreviousValue = (field, tap) => {
        if (
            (tap?.[REGULATION_MODE] ===
                PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id &&
                field === FLOW_SET_POINT_REGULATING_VALUE) ||
            (tap?.[REGULATION_MODE] ===
                PHASE_REGULATION_MODES.CURRENT_LIMITER.id &&
                field === CURRENT_LIMITER_REGULATING_VALUE)
        ) {
            return tap?.regulationValue;
        } else {
            return null;
        }
    };

    const regulationType = useMemo(() => {
        return (
            regulationTypeWatch ||
            getComputedPreviousPhaseRegulationType(previousValues)
        );
    }, [regulationTypeWatch, previousValues]);

    const regulationMode = useMemo(() => {
        return (
            regulationModeWatch ||
            getComputedPhaseTapChangerRegulationMode(
                previousValues?.[PHASE_TAP_CHANGER]
            )?.id
        );
    }, [regulationModeWatch, previousValues]);

    const regulationEnabled = useMemo(() => {
        return (
            phaseTapChangerEnabledWatch &&
            (regulationMode === PHASE_REGULATION_MODES.CURRENT_LIMITER.id ||
                regulationMode ===
                    PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id)
        );
    }, [phaseTapChangerEnabledWatch, regulationMode]);

    const regulationModeField = (
        <SelectInput
            name={`${id}.${REGULATION_MODE}`}
            label={'RegulationMode'}
            options={Object.values(PHASE_REGULATION_MODES)}
            disabled={!phaseTapChangerEnabledWatch}
            previousValue={getPhaseTapChangerRegulationModeLabel(
                previousValues?.[PHASE_TAP_CHANGER]
            )}
        />
    );

    const regulationTypeField = (
        <SelectInput
            name={`${id}.${REGULATION_TYPE}`}
            label={'RegulationTypeText'}
            options={Object.values(REGULATION_TYPES)}
            disabled={!regulationEnabled}
            size={'small'}
            disableClearable={!isModification}
            previousValue={getRegulationTypeLabel(
                previousValues,
                previousValues?.[PHASE_TAP_CHANGER]
            )}
        />
    );

    const sideField = (
        <SelectInput
            name={`${id}.${REGULATION_SIDE}`}
            label={'RegulatedSide'}
            options={Object.values(SIDE)}
            disabled={!regulationEnabled}
            size={'small'}
            disableClearable={!isModification}
            previousValue={getTapSideLabel(
                previousValues,
                previousValues?.[PHASE_TAP_CHANGER]
            )}
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
            previousValue={getRegulatingPreviousValue(
                CURRENT_LIMITER_REGULATING_VALUE,
                previousValues?.[PHASE_TAP_CHANGER]
            )}
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
            previousValue={getRegulatingPreviousValue(
                FLOW_SET_POINT_REGULATING_VALUE,
                previousValues?.[PHASE_TAP_CHANGER]
            )}
        />
    );

    const targetDeadbandField = (
        <FloatInput
            name={`${id}.${TARGET_DEADBAND}`}
            label="Deadband"
            adornment={
                regulationMode ===
                PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id
                    ? ActivePowerAdornment
                    : AmpereAdornment
            }
            formProps={{
                disabled: !regulationEnabled,
            }}
            previousValue={previousValues?.[PHASE_TAP_CHANGER]?.targetDeadband}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={id}
            disabled={!regulationEnabled}
            equipmentSectionTypeDefaultValue={
                EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER
            }
            studyUuid={studyUuid}
            currentNodeUuid={currentNode?.id}
            voltageLevelOptions={voltageLevelOptions}
            previousRegulatingTerminalValue={
                previousValues?.[PHASE_TAP_CHANGER]?.regulatingTerminalVlId
            }
            previousEquipmentSectionTypeValue={getTapChangerEquipmentSectionTypeValue(
                previousValues?.[PHASE_TAP_CHANGER]
            )}
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
                            {regulationMode ===
                                PHASE_REGULATION_MODES.CURRENT_LIMITER.id &&
                                currentLimiterRegulatingValueField}
                            {regulationMode ===
                                PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL
                                    .id && flowSetPointRegulatingValueField}
                        </Grid>
                        <Grid item xs={4}>
                            {targetDeadbandField}
                        </Grid>
                    </Grid>
                )}
                {regulationEnabled &&
                    regulationType === REGULATION_TYPES.DISTANT.id && (
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
                    regulationType === REGULATION_TYPES.LOCAL.id && (
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
                    previousValues={previousValues?.[PHASE_TAP_CHANGER]}
                    editData={editData}
                    currentNode={currentNode}
                    isModification={isModification}
                />
            </Grid>
        </>
    );
};

export default PhaseTapChangerPane;
