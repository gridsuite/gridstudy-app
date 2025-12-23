/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { LINE1_ID, LINE1_NAME, LINE2_ID, LINE2_NAME } from 'components/utils/field-constants';
import { useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/ControlPoint';
import EditIcon from '@mui/icons-material/Edit';
import { Identifiable, Option, TextInput } from '@gridsuite/commons-ui';
import { ConnectivityForm } from '../../connectivity/connectivity-form';
import { Button, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { LineToAttachOrSplitForm } from '../line-to-attach-or-split-form/line-to-attach-or-split-form';
import VoltageLevelCreationDialog from 'components/dialogs/network-modifications/voltage-level/creation/voltage-level-creation-dialog';
import { CONNECTIVITY, ID, VOLTAGE_LEVEL } from '../../../utils/field-constants';
import { useWatch } from 'react-hook-form';
import GridSection from '../../commons/grid-section';
import GridItem from '../../commons/grid-item';
import { UUID } from 'node:crypto';
import { VoltageLevelFormInfos } from '../voltage-level/voltage-level.type';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { FetchStatus } from '../../../../services/utils.type';

// TODO : create type for BusBarSectionType : busbarSections = BusBarSectionType[]

export interface ExtendedVoltageLevelFormInfos extends VoltageLevelFormInfos {
    busbarSections?: Option[];
    sectionCount: number;
    busbarCount: number;
}

export interface LineSplitWithVoltageLevelFormProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    onVoltageLevelCreationDo: (voltageLevel: any) => Promise<string>;
    voltageLevelToEdit: ExtendedVoltageLevelFormInfos | null;
    onVoltageLevelChange?: () => void;
    allVoltageLevelOptions: Identifiable[];
    isUpdate: boolean;
    editDataFetchStatus?: FetchStatus;
}

const LineSplitWithVoltageLevelForm = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    onVoltageLevelCreationDo,
    voltageLevelToEdit,
    allVoltageLevelOptions,
    isUpdate,
    editDataFetchStatus,
}: LineSplitWithVoltageLevelFormProps) => {
    const [voltageLevelDialogOpen, setVoltageLevelDialogOpen] = useState(false);

    const voltageLevelIdWatch = useWatch({
        name: `${CONNECTIVITY}.${VOLTAGE_LEVEL}.${ID}`,
    });

    const onVoltageLevelDialogClose = () => {
        setVoltageLevelDialogOpen(false);
    };

    const openVoltageLevelDialog = () => {
        setVoltageLevelDialogOpen(true);
    };

    const lineToSplitForm = (
        <LineToAttachOrSplitForm
            label={'LineToSplit'}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
        />
    );

    const newLine1IdField = <TextInput name={LINE1_ID} label={'Line1ID'} />;

    const newLine1NameField = <TextInput name={LINE1_NAME} label={'Line1Name'} />;

    const newLine2IdField = <TextInput name={LINE2_ID} label={'Line2ID'} />;

    const newLine2NameField = <TextInput name={LINE2_NAME} label={'Line2Name'} />;

    const isVoltageLevelEdit = voltageLevelToEdit?.equipmentId === voltageLevelIdWatch;

    const busbarSectionOptions = useMemo<Option[]>(() => {
        if (isVoltageLevelEdit && voltageLevelToEdit && voltageLevelToEdit.busbarSections) {
            return voltageLevelToEdit.busbarSections;
        } else {
            return [];
        }
    }, [isVoltageLevelEdit, voltageLevelToEdit]);

    const connectivityForm = (
        <ConnectivityForm
            voltageLevelSelectLabel={'VoltageLevelToSplitAt'}
            withPosition={false}
            withDirectionsInfos={false}
            voltageLevelOptions={allVoltageLevelOptions}
            newBusOrBusbarSectionOptions={busbarSectionOptions}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
        />
    );

    return (
        <>
            <GridSection title="LineToSplit" />
            <GridItem size={12}>{lineToSplitForm}</GridItem>
            <GridSection title="VOLTAGE_LEVEL" />
            <Grid container spacing={2}>
                <GridItem size={12}>{connectivityForm}</GridItem>
                <GridItem>
                    {
                        <Button
                            onClick={openVoltageLevelDialog}
                            startIcon={isVoltageLevelEdit ? <EditIcon /> : <AddIcon />}
                        >
                            <Typography align="left">
                                <FormattedMessage id="NewVoltageLevel" />
                            </Typography>
                        </Button>
                    }
                </GridItem>
            </Grid>
            <GridSection title="Line1" />
            <Grid container spacing={2}>
                <GridItem>{newLine1IdField}</GridItem>
                <GridItem>{newLine1NameField}</GridItem>
            </Grid>
            <GridSection title="Line2" />
            <Grid container spacing={2}>
                <GridItem>{newLine2IdField}</GridItem>
                <GridItem>{newLine2NameField}</GridItem>
            </Grid>
            {voltageLevelDialogOpen && (
                <VoltageLevelCreationDialog
                    open={true}
                    onClose={onVoltageLevelDialogClose}
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    onCreateVoltageLevel={onVoltageLevelCreationDo}
                    editData={isVoltageLevelEdit ? voltageLevelToEdit : null}
                    isUpdate={isUpdate}
                    editDataFetchStatus={editDataFetchStatus}
                />
            )}
        </>
    );
};

export default LineSplitWithVoltageLevelForm;
