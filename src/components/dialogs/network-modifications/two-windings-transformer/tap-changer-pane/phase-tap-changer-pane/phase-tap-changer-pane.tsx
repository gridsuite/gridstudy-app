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
import { ActivePowerAdornment, AmpereAdornment } from '../../../../dialog-utils';
import { PHASE_REGULATION_MODES, REGULATION_TYPES, SIDE } from 'components/network/constants';
import { EquipmentType, FloatInput, Identifiable, SelectInput } from '@gridsuite/commons-ui';
import { RegulatingTerminalForm } from '../../../../regulating-terminal/regulating-terminal-form';
import PhaseTapChangerPaneSteps from './phase-tap-changer-pane-steps';
import GridItem from '../../../../commons/grid-item';
import { NetworkModificationDialogProps } from '../../../../../graph/menus/network-modifications/network-modification-menu.type.js';
import GridSection from '../../../../commons/grid-section';
import { PhaseTapChangerFormInfos } from './phase-tap-changer.type';
import { useIntl } from 'react-intl';
import { useWatch } from 'react-hook-form';
import {
    getComputedPhaseTapChangerRegulationMode,
    getComputedPreviousPhaseRegulationType,
} from './phase-tap-changer-pane-utils';
import { useMemo } from 'react';

export type PhaseTapChangerPaneProps = NetworkModificationDialogProps & {
    id?: string;
    voltageLevelOptions: Identifiable[];
    previousValues?: PhaseTapChangerFormInfos;
    editData?: PhaseTapChangerFormInfos;
    equipmentId?: string;
    voltageLevelId1?: string;
    isModification?: boolean;
};

export default function PhaseTapChangerPane({
    id = PHASE_TAP_CHANGER,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    voltageLevelOptions = [],
    previousValues,
    editData,
    equipmentId,
    voltageLevelId1,
    isModification = false,
}: Readonly<PhaseTapChangerPaneProps>) {
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

    const getPhaseTapChangerRegulationModeLabel = (regulationMode?: string, isRegulating?: boolean) => {
        const computedRegulationMode = getComputedPhaseTapChangerRegulationMode(regulationMode, isRegulating);
        if (computedRegulationMode) {
            return intl.formatMessage({
                id: computedRegulationMode?.label,
            });
        }
    };

    const getRegulatingPreviousValue = (field: string, regulationMode?: string, regulationValue?: number | null) => {
        if (
            (regulationMode === PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id &&
                field === FLOW_SET_POINT_REGULATING_VALUE) ||
            (regulationMode === PHASE_REGULATION_MODES.CURRENT_LIMITER.id && field === CURRENT_LIMITER_REGULATING_VALUE)
        ) {
            return regulationValue ?? undefined;
        }
    };

    const regulationType = useMemo(() => {
        return regulationTypeWatch || getComputedPreviousPhaseRegulationType(equipmentId, previousValues);
    }, [regulationTypeWatch, equipmentId, previousValues]);

    const regulationMode = useMemo(() => {
        return (
            regulationModeWatch ||
            getComputedPhaseTapChangerRegulationMode(previousValues?.regulationMode, previousValues?.isRegulating)?.id
        );
    }, [regulationModeWatch, previousValues]);

    const getRegulationTypeLabel = (regulatingTerminalConnectableId?: string) => {
        if (regulatingTerminalConnectableId != null && equipmentId != null) {
            return intl.formatMessage({
                id:
                    regulatingTerminalConnectableId === equipmentId
                        ? REGULATION_TYPES.LOCAL.label
                        : REGULATION_TYPES.DISTANT.label,
            });
        }
        return undefined;
    };

    const getTapSideLabel = (regulatingTerminalVlId?: string, regulatingTerminalConnectableId?: string) => {
        if (regulatingTerminalConnectableId != null && equipmentId != null) {
            return intl.formatMessage({
                id: regulatingTerminalVlId === voltageLevelId1 ? SIDE.SIDE1.label : SIDE.SIDE2.label,
            });
        }
        return undefined;
    };

    const regulationModeField = (
        <SelectInput
            name={`${id}.${REGULATION_MODE}`}
            label={'RegulationMode'}
            options={Object.values(PHASE_REGULATION_MODES)}
            disabled={!phaseTapChangerEnabledWatch}
            size={'small'}
            previousValue={
                isModification
                    ? (getPhaseTapChangerRegulationModeLabel(
                          previousValues?.regulationMode,
                          previousValues?.isRegulating
                      ) ?? undefined)
                    : undefined
            }
        />
    );

    const regulationTypeField = (
        <SelectInput
            name={`${id}.${REGULATION_TYPE}`}
            label={'RegulationTypeText'}
            options={Object.values(REGULATION_TYPES)}
            disabled={!phaseTapChangerEnabledWatch}
            size={'small'}
            disableClearable={!isModification}
            previousValue={
                isModification
                    ? (getRegulationTypeLabel(previousValues?.regulatingTerminalConnectableId) ?? undefined)
                    : undefined
            }
        />
    );

    const sideField = (
        <SelectInput
            name={`${id}.${REGULATION_SIDE}`}
            label={'RegulatedSide'}
            options={Object.values(SIDE)}
            disabled={!phaseTapChangerEnabledWatch}
            size={'small'}
            disableClearable={!isModification}
            previousValue={
                isModification
                    ? (getTapSideLabel(
                          previousValues?.regulatingTerminalVlId,
                          previousValues?.regulatingTerminalConnectableId
                      ) ?? undefined)
                    : undefined
            }
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
            previousValue={
                isModification
                    ? (getRegulatingPreviousValue(
                          CURRENT_LIMITER_REGULATING_VALUE,
                          previousValues?.regulationMode,
                          previousValues?.regulationValue
                      ) ?? undefined)
                    : undefined
            }
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
            previousValue={
                isModification
                    ? (getRegulatingPreviousValue(
                          FLOW_SET_POINT_REGULATING_VALUE,
                          previousValues?.regulationMode,
                          previousValues?.regulationValue
                      ) ?? undefined)
                    : undefined
            }
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
            previousValue={previousValues?.targetDeadband ?? undefined}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={id}
            disabled={!phaseTapChangerEnabledWatch}
            equipmentSectionTypeDefaultValue={EquipmentType.TWO_WINDINGS_TRANSFORMER}
            studyUuid={studyUuid}
            currentNodeUuid={currentNode?.id}
            currentRootNetworkUuid={currentRootNetworkUuid}
            voltageLevelOptions={voltageLevelOptions}
            regulatingTerminalVlId={previousValues?.regulatingTerminalVlId ?? undefined}
            equipmentSectionType={
                isModification
                    ? previousValues?.regulatingTerminalConnectableType
                        ? previousValues?.regulatingTerminalConnectableType +
                          ' : ' +
                          previousValues?.regulatingTerminalConnectableId
                        : undefined
                    : undefined
            }
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
                <>
                    <GridSection title="RegulatedTerminal" heading={4} />
                    <Grid item container spacing={1}>
                        <GridItem size={4}>{regulationTypeField}</GridItem>
                        {regulationType === REGULATION_TYPES.LOCAL.id && <GridItem size={4}>{sideField}</GridItem>}
                        {regulationType === REGULATION_TYPES.DISTANT.id && (
                            <Grid item container spacing={1}>
                                <GridItem size={8}>{regulatingTerminalField}</GridItem>
                                <GridItem size={4}>{sideField}</GridItem>
                            </Grid>
                        )}
                    </Grid>
                </>
            )}
            <GridSection title="TapsSection" heading={4} />
            <PhaseTapChangerPaneSteps
                disabled={!phaseTapChangerEnabledWatch}
                previousValuesSteps={previousValues?.steps ?? undefined}
                previousValuesLowTapPosition={previousValues?.lowTapPosition}
                previousValuesHighTapPosition={previousValues?.highTapPosition}
                previousValuesTapPosition={previousValues?.tapPosition}
                editData={editData?.steps ?? undefined}
                currentNode={currentNode}
                isModification={isModification}
            />
        </>
    );
}
