/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { EQUIPMENT_ID, EQUIPMENT_NAME } from 'components/utils/field-constants';
import { useEffect, useState } from 'react';

import { filledTextField } from '../../../dialog-utils';

import { TextInput } from '@gridsuite/commons-ui';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import { CharacteristicsForm } from '../characteristics-pane/characteristics-form';
import { fetchVoltageLevelsListInfos } from '../../../../../services/study/network';
import PropertiesForm from '../../common/properties/properties-form';
import GridItem from '../../../commons/grid-item';
import GridSection from '../../../commons/grid-section';

const ShuntCompensatorCreationForm = ({ studyUuid, currentNode, currentRootNetworkUuid }) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    useEffect(() => {
        if (studyUuid && currentNode?.id && currentRootNetworkUuid) {
            fetchVoltageLevelsListInfos(studyUuid, currentNode.id, currentRootNetworkUuid).then((values) => {
                setVoltageLevelOptions(values.sort((a, b) => a?.id?.localeCompare(b?.id)));
            });
        }
    }, [studyUuid, currentNode?.id, currentRootNetworkUuid]);

    const shuntCompensatorIdField = (
        <TextInput name={EQUIPMENT_ID} label={'ID'} formProps={{ autoFocus: true, ...filledTextField }} />
    );

    const shuntCompensatorNameField = <TextInput name={EQUIPMENT_NAME} label={'Name'} formProps={filledTextField} />;

    const connectivityForm = (
        <ConnectivityForm
            withPosition={true}
            voltageLevelOptions={voltageLevelOptions}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
        />
    );

    const characteristicsForm = <CharacteristicsForm />;

    return (
        <>
            <Grid container spacing={2}>
                <GridItem size={4}>{shuntCompensatorIdField}</GridItem>
                <GridItem size={4}>{shuntCompensatorNameField}</GridItem>
            </Grid>
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                <GridItem size={12}>{connectivityForm}</GridItem>
            </Grid>
            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                <GridItem size={12}>{characteristicsForm}</GridItem>
            </Grid>
            <PropertiesForm networkElementType={'shuntCompensator'} />
        </>
    );
};

export default ShuntCompensatorCreationForm;
