/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    ATTACHMENT_LINE_ID,
    ATTACHMENT_POINT_ID,
    ATTACHMENT_POINT_NAME,
    CONNECTIVITY,
    ID,
    LINE1_ID,
    LINE1_NAME,
    LINE2_ID,
    LINE2_NAME,
    SUBSTATION_CREATION,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { FetchStatus, GsLang, Identifiable, TextInput } from '@gridsuite/commons-ui';
import { ConnectivityForm } from '../../connectivity/connectivity-form';
import { Box, Button, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import AddIcon from '@mui/icons-material/ControlPoint';
import EditIcon from '@mui/icons-material/Edit';
import LineCreationDialog from '../line/creation/line-creation-dialog';
import VoltageLevelCreationDialog from '../voltage-level/creation/voltage-level-creation-dialog';
import { LineToAttachOrSplitForm } from '../line-to-attach-or-split-form/line-to-attach-or-split-form';
import { useWatch } from 'react-hook-form';
import GridSection from '../../commons/grid-section';
import GridItem from '../../commons/grid-item';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import {
    ExtendedVoltageLevelCreationInfo,
    LineCreationInfos,
    VoltageLevelCreationInfo,
} from '../../../../services/network-modification-types';

interface LineAttachToVoltageLevelFormProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    onLineCreationDo: ({ lineCreationInfos }: { lineCreationInfos: LineCreationInfos }) => Promise<string>;
    lineToEdit?: LineCreationInfos;
    onVoltageLevelCreationDo: (voltageLevel: VoltageLevelCreationInfo) => Promise<string>;
    voltageLevelToEdit?: ExtendedVoltageLevelCreationInfo;
    onAttachmentPointModificationDo: (voltageLevel: VoltageLevelCreationInfo) => Promise<string>;
    attachmentPoint: ExtendedVoltageLevelCreationInfo;
    setAttachmentPoint: Dispatch<SetStateAction<ExtendedVoltageLevelCreationInfo>>;
    allVoltageLevelOptions: Identifiable[];
    isUpdate: boolean;
    language: GsLang;
    editDataFetchStatus?: FetchStatus;
}

const LineAttachToVoltageLevelForm = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    onLineCreationDo,
    lineToEdit,
    onVoltageLevelCreationDo,
    voltageLevelToEdit,
    onAttachmentPointModificationDo,
    attachmentPoint,
    setAttachmentPoint,
    allVoltageLevelOptions,
    isUpdate,
    language,
    editDataFetchStatus,
}: Readonly<LineAttachToVoltageLevelFormProps>) => {
    const [lineDialogOpen, setLineDialogOpen] = useState(false);
    const [voltageLevelDialogOpen, setVoltageLevelDialogOpen] = useState(false);
    const [attachmentPointDialogOpen, setAttachmentPointDialogOpen] = useState(false);
    const voltageLevelIdWatch = useWatch({
        name: `${CONNECTIVITY}.${VOLTAGE_LEVEL}.${ID}`,
    });

    const onLineDialogClose = () => {
        setLineDialogOpen(false);
    };

    const openLineDialog = () => {
        setLineDialogOpen(true);
    };

    const onAttachmentPointDialogClose = () => {
        setAttachmentPointDialogOpen(false);
    };

    const openAttachmentPointDialog = () => {
        setAttachmentPointDialogOpen(true);
    };

    const onVoltageLevelDialogClose = () => {
        setVoltageLevelDialogOpen(false);
    };

    const openVoltageLevelDialog = () => {
        setVoltageLevelDialogOpen(true);
    };

    const lineToAttachToForm = (
        <LineToAttachOrSplitForm
            label={'LineToAttachTo'}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
        />
    );

    const onAttachmentPointIdChange = useCallback(
        (value: string) => {
            setAttachmentPoint((prevAttachmentPoint) => {
                return { ...prevAttachmentPoint, equipmentId: value };
            });
        },
        [setAttachmentPoint]
    );

    const attachmentPointIdField = (
        <TextInput name={ATTACHMENT_POINT_ID} label={'AttachmentPointId'} onChange={onAttachmentPointIdChange} />
    );

    const onAttachmentPointNameChange = useCallback(
        (value: string) => {
            setAttachmentPoint((prevAttachmentPoint) => {
                return { ...prevAttachmentPoint, equipmentName: value };
            });
        },
        [setAttachmentPoint]
    );

    const attachmentPointNameField = (
        <TextInput name={ATTACHMENT_POINT_NAME} label={'AttachmentPointName'} onChange={onAttachmentPointNameChange} />
    );

    const lineToIdField = (
        <TextInput name={ATTACHMENT_LINE_ID} label={'AttachedLineId'} formProps={{ disabled: true }} />
    );

    const newLine1IdField = <TextInput name={LINE1_ID} label={'Line1ID'} />;

    const newLine1NameField = <TextInput name={LINE1_NAME} label={'Line1Name'} />;

    const newLine2IdField = <TextInput name={LINE2_ID} label={'Line2ID'} />;

    const newLine2NameField = <TextInput name={LINE2_NAME} label={'Line2Name'} />;

    const isVoltageLevelEdit = voltageLevelToEdit?.equipmentId === voltageLevelIdWatch;

    const busbarSectionOptions = useMemo(() => {
        if (isVoltageLevelEdit && voltageLevelToEdit?.busbarSections) {
            return voltageLevelToEdit.busbarSections;
        } else {
            return [];
        }
    }, [isVoltageLevelEdit, voltageLevelToEdit]);

    const connectivityForm = (
        <ConnectivityForm
            voltageLevelSelectLabel={'AttachedVoltageLevelId'}
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
            <GridSection title="LineToAttachTo" />
            <GridItem size={12}>{lineToAttachToForm}</GridItem>
            <GridSection title="AttachmentPoint" />
            <Grid container spacing={2}>
                <GridItem>{attachmentPointIdField}</GridItem>
                <GridItem>{attachmentPointNameField}</GridItem>
                <GridItem>
                    {
                        <Button
                            onClick={openAttachmentPointDialog}
                            // as equipmentId and equipmentName are synchronized to check if the icon is add or edit
                            // other attributes than id and name must be present
                            startIcon={
                                attachmentPoint != null &&
                                Object.keys(attachmentPoint).some((key) => key === SUBSTATION_CREATION) ? (
                                    <EditIcon />
                                ) : (
                                    <AddIcon />
                                )
                            }
                        >
                            <Typography align="left">
                                <FormattedMessage id="SpecifyAttachmentPoint" />
                            </Typography>
                        </Button>
                    }
                </GridItem>
            </Grid>
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
            <GridSection title="AttachedLine" />
            <Grid container spacing={2}>
                <GridItem>{lineToIdField}</GridItem>
                <Box width="100%" />
                <GridItem>
                    {
                        <Button onClick={openLineDialog} startIcon={lineToEdit ? <EditIcon /> : <AddIcon />}>
                            <Typography align="left">
                                <FormattedMessage id="AttachedLine" />
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
            {attachmentPointDialogOpen && (
                <VoltageLevelCreationDialog
                    open={true}
                    onClose={onAttachmentPointDialogClose}
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    onCreateVoltageLevel={onAttachmentPointModificationDo}
                    editData={attachmentPoint as any}
                    isAttachmentPointModification={true}
                    titleId={'SpecifyAttachmentPoint'}
                    isUpdate={isUpdate}
                    language={language}
                    editDataFetchStatus={editDataFetchStatus}
                />
            )}
            {voltageLevelDialogOpen && (
                <VoltageLevelCreationDialog
                    open={true}
                    onClose={onVoltageLevelDialogClose}
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    onCreateVoltageLevel={onVoltageLevelCreationDo}
                    editData={isVoltageLevelEdit && voltageLevelToEdit ? (voltageLevelToEdit as any) : undefined}
                    isUpdate={isUpdate}
                    language={language}
                    editDataFetchStatus={editDataFetchStatus}
                />
            )}
            {lineDialogOpen && (
                <LineCreationDialog
                    onClose={onLineDialogClose}
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    displayConnectivity={false}
                    onCreateLine={onLineCreationDo}
                    editData={lineToEdit}
                    isUpdate={isUpdate}
                    editDataFetchStatus={editDataFetchStatus}
                />
            )}
        </>
    );
};

export default LineAttachToVoltageLevelForm;
