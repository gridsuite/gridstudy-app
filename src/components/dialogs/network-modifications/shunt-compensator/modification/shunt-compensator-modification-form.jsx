/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TextInput } from '@gridsuite/commons-ui';
import { EQUIPMENT_NAME } from '../../../../utils/field-constants';
import { filledTextField } from '../../../dialog-utils';
import { TextField, Grid } from '@mui/material';
import { CharacteristicsForm } from '../characteristics-pane/characteristics-form';
import PropertiesForm from '../../common/properties/properties-form';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import GridItem from '../../../commons/grid-item';
import GridSection from '../../../commons/grid-section';

const ShuntCompensatorModificationForm = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    shuntCompensatorInfos,
    equipmentId,
}) => {
    const shuntCompensatorIdField = (
        <TextField
            size="small"
            fullWidth
            label={'ID'}
            value={equipmentId}
            InputProps={{
                readOnly: true,
            }}
            disabled
            {...filledTextField}
        />
    );
    const shuntCompensatorNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={shuntCompensatorInfos?.name}
            clearable
        />
    );

    const characteristicsForm = <CharacteristicsForm previousValues={shuntCompensatorInfos} isModification={true} />;

    const connectivityForm = (
        <ConnectivityForm
            withPosition={true}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
            isEquipmentModification={true}
            previousValues={shuntCompensatorInfos}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <GridItem size={4}>{shuntCompensatorIdField}</GridItem>
                <GridItem size={4}>{shuntCompensatorNameField}</GridItem>
            </Grid>
            {/* Connectivity part */}
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                <GridItem size={12}>{connectivityForm}</GridItem>
            </Grid>
            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                <GridItem size={12}>{characteristicsForm}</GridItem>
            </Grid>
            <PropertiesForm networkElementType={'shuntCompensator'} isModification={true} />
        </>
    );
};

export default ShuntCompensatorModificationForm;
