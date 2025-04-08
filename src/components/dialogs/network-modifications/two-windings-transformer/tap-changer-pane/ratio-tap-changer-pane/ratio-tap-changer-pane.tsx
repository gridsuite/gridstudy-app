/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import {
    ENABLED,
    LOAD_TAP_CHANGING_CAPABILITIES,
    RATIO_TAP_CHANGER,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    TARGET_DEADBAND,
    TARGET_V,
} from 'components/utils/field-constants';
import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { VoltageAdornment } from '../../../../dialog-utils';
import { EquipmentType, FloatInput, Identifiable, SelectInput, SwitchInput } from '@gridsuite/commons-ui';
import { RegulatingTerminalForm } from '../../../../regulating-terminal/regulating-terminal-form';
import RatioTapChangerPaneSteps from './ratio-tap-changer-pane-steps';
import { RATIO_REGULATION_MODES, REGULATION_TYPES, SIDE } from 'components/network/constants';
import CheckboxNullableInput from 'components/utils/rhf-inputs/boolean-nullable-input';
import { getComputedPreviousRatioRegulationType } from './ratio-tap-changer-pane-utils';
import GridItem from '../../../../commons/grid-item';
import GridSection from '../../../../commons/grid-section';
import { NetworkModificationDialogProps } from '../../../../../graph/menus/network-modifications/network-modification-menu.type';
import { RatioTapChangerFormInfos } from './ratio-tap-changer.type';
import { useIntl } from 'react-intl';
import { RatioTapChangerInfos } from '../../../../../../services/network-modification-types';

export type RatioTapChangerPaneProps = NetworkModificationDialogProps & {
    id?: string;
    voltageLevelOptions: Identifiable[];
    previousValues?: RatioTapChangerFormInfos;
    editData?: RatioTapChangerInfos;
    equipmentId?: string;
    voltageLevelId1?: string;
    isModification?: boolean;
};

export default function RatioTapChangerPane({
    id = RATIO_TAP_CHANGER,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    voltageLevelOptions = [],
    previousValues,
    editData,
    equipmentId,
    voltageLevelId1,
    isModification = false,
}: Readonly<RatioTapChangerPaneProps>) {
    const { trigger } = useFormContext();
    const intl = useIntl();

    const previousRegulation = (hasLoadTapChangingCapabilities?: boolean) => {
        if (hasLoadTapChangingCapabilities) {
            return intl.formatMessage({ id: 'On' });
        }
        if (!hasLoadTapChangingCapabilities) {
            return intl.formatMessage({ id: 'Off' });
        }
        return null;
    };

    const getRatioTapChangerRegulationModeLabel = (isRegulating?: boolean) => {
        if (isRegulating) {
            return intl.formatMessage({
                id: RATIO_REGULATION_MODES.VOLTAGE_REGULATION.label,
            });
        } else {
            return intl.formatMessage({
                id: RATIO_REGULATION_MODES.FIXED_RATIO.label,
            });
        }
    };

    const getRegulationTypeLabel = (regulatingTerminalConnectableId?: string) => {
        if (regulatingTerminalConnectableId != null) {
            return regulatingTerminalConnectableId === equipmentId
                ? intl.formatMessage({ id: REGULATION_TYPES.LOCAL.label })
                : intl.formatMessage({ id: REGULATION_TYPES.DISTANT.label });
        }
    };

    const getTapSideLabel = (regulatingTerminalVlId?: string, regulatingTerminalConnectableId?: string) => {
        if (regulatingTerminalConnectableId === equipmentId) {
            return regulatingTerminalVlId === voltageLevelId1
                ? intl.formatMessage({ id: SIDE.SIDE1.label })
                : intl.formatMessage({ id: SIDE.SIDE2.label });
        }
    };

    const ratioTapChangerEnabledWatcher = useWatch({
        name: `${id}.${ENABLED}`,
    });

    const ratioTapLoadTapChangingCapabilitiesWatcher = useWatch({
        name: `${id}.${LOAD_TAP_CHANGING_CAPABILITIES}`,
    });

    const isRatioTapLoadTapChangingCapabilitiesOn =
        ratioTapLoadTapChangingCapabilitiesWatcher ||
        (ratioTapLoadTapChangingCapabilitiesWatcher === null &&
            previousValues?.hasLoadTapChangingCapabilities === true);

    const regulationModeWatch = useWatch({
        name: `${id}.${REGULATION_MODE}`,
    });

    const regulationTypeWatch = useWatch({
        name: `${id}.${REGULATION_TYPE}`,
    });

    const regulationType = useMemo(() => {
        return regulationTypeWatch || getComputedPreviousRatioRegulationType(equipmentId, previousValues);
    }, [equipmentId, previousValues, regulationTypeWatch]);

    // we want to update the validation of these fields when they become optionals to remove the red alert
    useEffect(() => {
        if (regulationModeWatch === RATIO_REGULATION_MODES.FIXED_RATIO.id) {
            trigger(`${id}.${REGULATION_TYPE}`).then();
            trigger(`${id}.${REGULATION_SIDE}`).then();
            trigger(`${id}.${TARGET_V}`).then();
        }
    }, [regulationModeWatch, trigger, id]);

    const ratioTapLoadTapChangingCapabilitiesField = isModification ? (
        <CheckboxNullableInput
            name={`${id}.${LOAD_TAP_CHANGING_CAPABILITIES}`}
            label="OnLoad"
            formProps={{
                disabled: !ratioTapChangerEnabledWatcher,
            }}
            previousValue={previousRegulation(previousValues?.hasLoadTapChangingCapabilities ?? undefined) ?? undefined}
        />
    ) : (
        <SwitchInput
            name={`${id}.${LOAD_TAP_CHANGING_CAPABILITIES}`}
            label="OnLoad"
            formProps={{
                disabled: !ratioTapChangerEnabledWatcher,
            }}
        />
    );

    const regulationModeField = (
        <SelectInput
            name={`${id}.${REGULATION_MODE}`}
            label={'RegulationMode'}
            options={Object.values(RATIO_REGULATION_MODES)}
            size={'small'}
            disabled={!ratioTapChangerEnabledWatcher}
            previousValue={
                isModification ? getRatioTapChangerRegulationModeLabel(previousValues?.isRegulating) : undefined
            }
        />
    );

    const regulationTypeField = (
        <SelectInput
            name={`${id}.${REGULATION_TYPE}`}
            label={'RegulationTypeText'}
            options={Object.values(REGULATION_TYPES)}
            disabled={!ratioTapChangerEnabledWatcher}
            size={'small'}
            previousValue={
                isModification ? getRegulationTypeLabel(previousValues?.regulatingTerminalConnectableId) : undefined
            }
        />
    );

    const sideField = (
        <SelectInput
            name={`${id}.${REGULATION_SIDE}`}
            label={'RegulatedSide'}
            options={Object.values(SIDE)}
            disabled={!ratioTapChangerEnabledWatcher}
            size={'small'}
            previousValue={
                isModification
                    ? getTapSideLabel(
                          previousValues?.regulatingTerminalVlId,
                          previousValues?.regulatingTerminalConnectableId
                      )
                    : undefined
            }
        />
    );

    const targetVoltage1Field = (
        <FloatInput
            name={`${id}.${TARGET_V}`}
            label="TargetVoltage"
            adornment={VoltageAdornment}
            formProps={{
                disabled: !ratioTapChangerEnabledWatcher,
            }}
            previousValue={isModification ? previousValues?.targetV : undefined}
        />
    );

    const targetDeadbandField = (
        <FloatInput
            name={`${id}.${TARGET_DEADBAND}`}
            label="Deadband"
            adornment={VoltageAdornment}
            formProps={{
                disabled: !ratioTapChangerEnabledWatcher,
            }}
            previousValue={isModification ? previousValues?.targetDeadband : undefined}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={id}
            disabled={!ratioTapChangerEnabledWatcher}
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
            <GridItem size={4}>{ratioTapLoadTapChangingCapabilitiesField}</GridItem>

            {isRatioTapLoadTapChangingCapabilitiesOn && (
                <>
                    <GridSection title="RegulatedTerminal" heading={4} />
                    <Grid item container spacing={1}>
                        <GridItem size={4}>{regulationTypeField}</GridItem>
                        {regulationType === REGULATION_TYPES.LOCAL.id && <GridItem size={4}>{sideField}</GridItem>}
                        {regulationType === REGULATION_TYPES.DISTANT.id && (
                            <GridItem size={8}>{regulatingTerminalField}</GridItem>
                        )}
                    </Grid>

                    <GridSection title="RegulationSection" heading={4} />
                    <Grid item container spacing={1}>
                        <GridItem size={4}>{regulationModeField}</GridItem>
                        <GridItem size={4}>{targetVoltage1Field}</GridItem>
                        <GridItem size={4}>{targetDeadbandField}</GridItem>
                    </Grid>
                </>
            )}

            <GridSection title="TapsSection" heading={4} />
            <RatioTapChangerPaneSteps
                disabled={!ratioTapChangerEnabledWatcher}
                previousValuesSteps={previousValues?.steps ?? undefined}
                previousValuesLowTapPosition={previousValues?.lowTapPosition}
                previousValuesHighTapPosition={previousValues?.highTapPosition}
                previousValuesTapPosition={previousValues?.tapPosition}
                editData={editData?.steps}
                currentNode={currentNode}
                isModification={isModification}
            />
        </>
    );
}
