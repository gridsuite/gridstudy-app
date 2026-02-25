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
    REGULATION_TYPE,
    TARGET_DEADBAND,
} from 'components/utils/field-constants';
import { useWatch } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { PHASE_REGULATION_MODES } from 'components/network/constants';
import { ActivePowerAdornment, AmpereAdornment, FloatInput, SelectInput } from '@gridsuite/commons-ui';
import PhaseTapChangerPaneSteps from './phase-tap-changer-pane-steps';
import {
    getComputedPhaseTapChangerRegulationMode,
    getComputedPreviousPhaseRegulationType,
} from './phase-tap-changer-pane-utils';
import { useMemo } from 'react';
import GridItem from '../../../../commons/grid-item';
import GridSection from '../../../../commons/grid-section';
import RegulatedTerminalSection from '../regulated-terminal-section';
import { TapChangerMapInfos, TapChangerPaneProps } from '../../two-windings-transformer.types';

const PhaseTapChangerPane = ({
    id = PHASE_TAP_CHANGER,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    voltageLevelOptions = [],
    previousValues,
    editData,
    isModification = false,
}: TapChangerPaneProps) => {
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

    const getPhaseTapChangerRegulationModeLabel = (phaseTapChangerFormValues?: TapChangerMapInfos | null) => {
        const computedRegulationMode = getComputedPhaseTapChangerRegulationMode(phaseTapChangerFormValues ?? undefined);
        if (computedRegulationMode) {
            return intl.formatMessage({
                id: computedRegulationMode?.label,
            });
        }
    };

    const getRegulatingPreviousValue = (field: string, tap?: TapChangerMapInfos) => {
        if (
            (tap?.[REGULATION_MODE] === PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id &&
                field === FLOW_SET_POINT_REGULATING_VALUE) ||
            (tap?.[REGULATION_MODE] === PHASE_REGULATION_MODES.CURRENT_LIMITER.id &&
                field === CURRENT_LIMITER_REGULATING_VALUE)
        ) {
            return tap?.regulationValue;
        } else {
            return undefined;
        }
    };

    const regulationType = useMemo(() => {
        return regulationTypeWatch || getComputedPreviousPhaseRegulationType(previousValues);
    }, [regulationTypeWatch, previousValues]);

    const regulationMode = useMemo(() => {
        return regulationModeWatch || getComputedPhaseTapChangerRegulationMode(previousValues?.phaseTapChanger)?.id;
    }, [regulationModeWatch, previousValues]);

    const regulationModeField = (
        <SelectInput
            name={`${id}.${REGULATION_MODE}`}
            label={'RegulationMode'}
            options={Object.values(PHASE_REGULATION_MODES)}
            disabled={!phaseTapChangerEnabledWatch}
            size="small"
            previousValue={getPhaseTapChangerRegulationModeLabel(previousValues?.phaseTapChanger)}
        />
    );

    const currentLimiterRegulatingValueField = (
        <FloatInput
            name={`${id}.${CURRENT_LIMITER_REGULATING_VALUE}`}
            label="RegulatingValueCurrentLimiter"
            formProps={{
                disabled: !phaseTapChangerEnabledWatch,
            }}
            adornment={AmpereAdornment}
            previousValue={getRegulatingPreviousValue(
                CURRENT_LIMITER_REGULATING_VALUE,
                previousValues?.phaseTapChanger
            )}
        />
    );

    const flowSetPointRegulatingValueField = (
        <FloatInput
            name={`${id}.${FLOW_SET_POINT_REGULATING_VALUE}`}
            label="RegulatingValueActivePowerControl"
            adornment={ActivePowerAdornment}
            formProps={{
                disabled: !phaseTapChangerEnabledWatch,
            }}
            previousValue={getRegulatingPreviousValue(FLOW_SET_POINT_REGULATING_VALUE, previousValues?.phaseTapChanger)}
        />
    );

    const targetDeadbandField = (
        <FloatInput
            name={`${id}.${TARGET_DEADBAND}`}
            label="Deadband"
            adornment={
                regulationMode === PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id
                    ? ActivePowerAdornment
                    : AmpereAdornment
            }
            formProps={{
                disabled: !phaseTapChangerEnabledWatch,
            }}
            previousValue={previousValues?.phaseTapChanger?.targetDeadband}
        />
    );

    return (
        <>
            <GridSection title="RegulationSection" heading={4} />
            <Grid item container spacing={1}>
                <GridItem size={4}>{regulationModeField}</GridItem>
                {regulationMode === PHASE_REGULATION_MODES.CURRENT_LIMITER.id && (
                    <>
                        <GridItem size={4}>{currentLimiterRegulatingValueField}</GridItem>
                        <GridItem size={4}>{targetDeadbandField}</GridItem>
                    </>
                )}
                {regulationMode === PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id && (
                    <>
                        <GridItem size={4}>{flowSetPointRegulatingValueField}</GridItem>
                        <GridItem size={4}>{targetDeadbandField}</GridItem>
                    </>
                )}
            </Grid>

            {phaseTapChangerEnabledWatch && regulationMode && (
                <RegulatedTerminalSection
                    id={id}
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    voltageLevelOptions={voltageLevelOptions}
                    previousValues={previousValues}
                    tapChangerDisabled={!phaseTapChangerEnabledWatch}
                    regulationType={regulationType}
                />
            )}
            <GridSection title="TapsSection" heading={4} />
            <PhaseTapChangerPaneSteps
                disabled={!phaseTapChangerEnabledWatch}
                previousValues={previousValues?.phaseTapChanger}
                editData={editData}
                currentNode={currentNode}
                isModification={isModification}
            />
        </>
    );
};

export default PhaseTapChangerPane;
