/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    CustomMuiDialog,
    DescriptionField,
    ElementType,
    fetchDirectoryElementPath,
    Parameter,
    SelectInput,
    snackWithFallback,
    TextInput,
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
} from './export-network-utils';
import { useIntl } from 'react-intl';
import { DirectoryItemSelect } from './directory-item-select';

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

    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    const nodeName = useMemo(() => treeNodes?.find((node) => node.id === nodeUuid)?.data.label, [treeNodes, nodeUuid]);

    const methods = useForm<ExportNetworkFormData>({
        defaultValues: emptyData,
        resolver: yupResolver(schema),
    });

    const { reset, subscribe, setValue, getValues, watch } = methods;
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
                        <DirectoryItemSelect
                            name={FOLDER_NAME}
                            types={[ElementType.DIRECTORY]}
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
