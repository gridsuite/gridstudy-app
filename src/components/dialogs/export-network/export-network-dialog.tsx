/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Button, FormHelperText, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    CustomMuiDialog,
    DescriptionField,
    DirectoryItemSelector,
    ElementType,
    fetchDirectoryElementPath,
    Parameter,
    SelectInput,
    snackWithFallback,
    TextInput,
    TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { ExportFormatProperties, getAvailableExportFormats } from '../../../services/study';
import { useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { PARAM_DEVELOPER_MODE } from '../../../utils/config-params';
import { useParameterState } from '../parameters/use-parameters-state';
import { AppState } from '../../../redux/reducer';

import {
    EXPORT_DESTINATION,
    EXPORT_FORMAT,
    EXPORT_PARAMETERS,
    FILE_NAME,
    FOLDER_NAME,
} from 'components/utils/field-constants';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FlatParametersInput } from './flat-parameters-input';
import {
    emptyData,
    emptyObj,
    ExportDestinationType,
    ExportNetworkFormData,
    getDefaultValuesForExtensionsParameter,
    schema,
    separator,
} from './export-network-utils';
import { FormattedMessage, useIntl } from 'react-intl';

/**
 * Dialog to export the network case
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {EventListener} onClick Event to submit the export
 * @param {String} studyUuid the uuid of the study to export
 * @param {String} nodeUuid the uuid of the selected node
 */
interface ExportNetworkDialogProps {
    open: boolean;
    onClose: () => void;
    onClick: (nodeUuid: UUID, params: Record<string, any>, selectedFormat: string, fileName: string) => void;
    studyUuid: UUID;
    nodeUuid: UUID;
}

export function ExportNetworkDialog({
    open,
    onClose,
    onClick,
    studyUuid,
    nodeUuid,
}: Readonly<ExportNetworkDialogProps>) {
    const [formatsWithParameters, setFormatsWithParameters] = useState<Record<string, ExportFormatProperties>>({});
    const [parameters, setParameters] = useState<Parameter[]>();
    const { snackError } = useSnackMessage();
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedFolder, setSelectedFolder] = useState<string>('');

    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    const nodeName = useMemo(() => treeNodes?.find((node) => node.id === nodeUuid)?.data.label, [treeNodes, nodeUuid]);

    const methods = useForm<ExportNetworkFormData>({
        defaultValues: emptyData,
        resolver: yupResolver(schema),
    });

    const {
        reset,
        subscribe,
        setValue,
        getValues,
        watch,
        formState: { errors },
    } = methods;
    const intl = useIntl();

    // fetch study name to build the default file name
    useEffect(() => {
        if (studyUuid) {
            fetchDirectoryElementPath(studyUuid)
                .then((response) => {
                    const studyName = response[response.length - 1]?.elementName;
                    reset((formValues) => ({
                        ...formValues,
                        [FILE_NAME]: `${studyName}_${nodeName}`,
                    }));
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'LoadStudyAndParentsInfoError' });
                });
        }
    }, [studyUuid, nodeName, snackError, reset]);

    useEffect(() => {
        if (open) {
            getAvailableExportFormats().then((formats) => {
                const XIIDM_FORMAT = 'XIIDM';
                const availableFormats = enableDeveloperMode
                    ? formats
                    : Object.fromEntries(Object.entries(formats).filter(([key]) => key === XIIDM_FORMAT));

                Object.values(availableFormats).forEach((format) => {
                    format.parameters = getDefaultValuesForExtensionsParameter(format.parameters);
                });
                setFormatsWithParameters(availableFormats);
            });
        }
    }, [open, enableDeveloperMode]);

    const onSubmit = useCallback(
        (data: ExportNetworkFormData) => {
            onClick(nodeUuid, data[EXPORT_PARAMETERS], data[EXPORT_FORMAT], data[FILE_NAME]);
        },
        [nodeUuid, onClick]
    );

    useEffect(() => {
        const unsubscribe = subscribe({
            name: [`${EXPORT_FORMAT}`],
            formState: {
                values: true, // Subscribe to field value changes
            },
            callback: () => {
                //When an export format changes, reset export parameters
                setValue(EXPORT_PARAMETERS, emptyObj);
                // get corresponding parameters of the selected format
                setParameters(formatsWithParameters[getValues(EXPORT_FORMAT)]?.parameters);
            },
        });
        return () => unsubscribe();
    }, [setValue, subscribe, getValues, formatsWithParameters]);

    const onNodeChanged = useCallback(
        (nodes: TreeViewFinderNodeProps[]) => {
            if (nodes.length > 0) {
                let updatedFolder: string = nodes[0].name;
                let parentNode: TreeViewFinderNodeProps = nodes[0];
                while (parentNode.parents && parentNode.parents?.length > 0) {
                    parentNode = parentNode?.parents[0];
                    updatedFolder = parentNode.name + separator + updatedFolder;
                }
                updatedFolder = separator + updatedFolder;
                setSelectedFolder(updatedFolder);
                setValue(FOLDER_NAME, updatedFolder);
            }
            setIsOpen(false);
        },
        [setValue]
    );

    const destinationValue = watch(EXPORT_DESTINATION);

    return (
        <CustomMuiDialog
            onClose={onClose}
            open={open}
            formSchema={schema}
            formMethods={methods}
            onSave={onSubmit}
            titleId="exportNetwork"
            sx={{
                '.MuiDialog-paper': {
                    minWidth: '30vw',
                },
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
                <TextInput name={FILE_NAME} label="download.fileName" />
                <SelectInput
                    name={EXPORT_DESTINATION}
                    options={Object.values(ExportDestinationType).map((item) => {
                        return { id: item, label: item };
                    })}
                    size="small"
                    label="destination"
                />

                {destinationValue === ExportDestinationType.GRID_EXPLORE && (
                    <Box>
                        <DescriptionField />
                        <Stack direction={'row'} alignItems="center" justifyContent="space-between">
                            <Typography variant="body2" color="textSecondary" noWrap>
                                {selectedFolder || <FormattedMessage id="NoFolder" />}
                                {!selectedFolder && errors?.folderName?.message && (
                                    <FormHelperText error>{intl.formatMessage({ id: 'YupRequired' })}</FormHelperText>
                                )}
                            </Typography>

                            <Button
                                onClick={() => setIsOpen(true)}
                                variant="contained"
                                color="primary"
                                component="label"
                            >
                                <FormattedMessage id={selectedFolder ? 'edit' : 'Select'} />
                            </Button>
                        </Stack>

                        <DirectoryItemSelector
                            open={isOpen}
                            types={[ElementType.DIRECTORY]}
                            onClose={onNodeChanged}
                            multiSelect={false}
                            onlyLeaves={false}
                            title={intl.formatMessage({
                                id: 'showSelectDirectoryDialog',
                            })}
                        />
                    </Box>
                )}

                <SelectInput
                    name={EXPORT_FORMAT}
                    label="exportFormat"
                    options={Object.keys(formatsWithParameters)}
                    size="small"
                    disableClearable
                />
                <FlatParametersInput name={EXPORT_PARAMETERS} parameters={parameters} />
            </Box>
        </CustomMuiDialog>
    );
}
