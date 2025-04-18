/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Identifiable, SelectInput } from '@gridsuite/commons-ui';
import {
    PHASE_TAP_CHANGER,
    RATIO_TAP_CHANGER,
    REGULATION_SIDE,
    REGULATION_TYPE,
} from '../../../../utils/field-constants';
import { REGULATION_TYPES, SIDE } from '../../../../network/constants';
import { getRegulationTypeLabel, getTapSideLabel } from './tap-changer-pane-utils';
import { useIntl } from 'react-intl';
import GridSection from '../../../commons/grid-section';
import GridItem from '../../../commons/grid-item';
import Grid from '@mui/material/Grid';
import { RegulatingTerminalForm } from '../../../regulating-terminal/regulating-terminal-form';
import { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import { getTapChangerEquipmentSectionTypeValue } from '../../../../utils/utils';
import { UUID } from 'crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { DeepPartialSkipArrayKey, FieldValues } from 'react-hook-form';

export default function RegulatedTerminalSection({
    id,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    voltageLevelOptions,
    previousValues,
    tapChangerEnabledWatcher,
    regulationType,
}: {
    id: string;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    voltageLevelOptions: Identifiable[];
    previousValues: any;
    tapChangerEnabledWatcher: DeepPartialSkipArrayKey<FieldValues>;
    regulationType: unknown;
}) {
    const intl = useIntl();
    const prevValues =
        id === RATIO_TAP_CHANGER
            ? previousValues?.ratioTapChanger
            : id === PHASE_TAP_CHANGER
              ? previousValues?.phaseTapChanger
              : undefined;

    const regulationTypeField = (
        <SelectInput
            name={`${id}.${REGULATION_TYPE}`}
            label={'RegulationTypeText'}
            options={Object.values(REGULATION_TYPES)}
            disabled={!tapChangerEnabledWatcher}
            size="small"
            previousValue={getRegulationTypeLabel(prevValues, prevValues, intl) ?? undefined}
        />
    );

    const sideField = (
        <SelectInput
            name={`${id}.${REGULATION_SIDE}`}
            label={'RegulatedSide'}
            options={Object.values(SIDE)}
            disabled={!tapChangerEnabledWatcher}
            size="small"
            previousValue={getTapSideLabel(prevValues, prevValues, intl) ?? undefined}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={id}
            disabled={!tapChangerEnabledWatcher}
            equipmentSectionTypeDefaultValue={EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER}
            studyUuid={studyUuid}
            currentNodeUuid={currentNode?.id}
            currentRootNetworkUuid={currentRootNetworkUuid}
            voltageLevelOptions={voltageLevelOptions}
            regulatingTerminalVlId={prevValues?.regulatingTerminalVlId}
            equipmentSectionType={getTapChangerEquipmentSectionTypeValue(prevValues) ?? undefined}
        />
    );

    return (
        <>
            <GridSection title="RegulatedTerminal" heading={4} />
            <Grid item container spacing={1}>
                <GridItem size={4}>{regulationTypeField}</GridItem>
                {regulationType === REGULATION_TYPES.LOCAL.id && <GridItem size={4}>{sideField}</GridItem>}
                {regulationType === REGULATION_TYPES.DISTANT.id && (
                    <GridItem size={8}>{regulatingTerminalField}</GridItem>
                )}
            </Grid>
        </>
    );
}
