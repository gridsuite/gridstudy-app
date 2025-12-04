/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box, Collapse, IconButton, Stack, Typography } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormattedMessage } from 'react-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    CustomMuiDialog,
    fetchDirectoryElementPath,
    FlatParameters,
    Parameter,
    SelectInput,
    snackWithFallback,
    TextInput,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { ExportFormatProperties, getAvailableExportFormats } from '../../services/study';
import { useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { PARAM_DEVELOPER_MODE } from '../../utils/config-params';
import { useParameterState } from './parameters/use-parameters-state';
import { AppState } from '../../redux/reducer';

import { EXPORT_FORMAT, EXPORT_PARAMETERS, FILE_NAME } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import { useController, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { IGNORED_PARAMS } from './root-network/ignored-params';

const STRING_LIST = 'STRING_LIST';

/**
 * Dialog to export the network case
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {EventListener} onClick Event to submit the export
 * @param {String} studyUuid the uuid of the study to export
 * @param {String} nodeUuid the uuid of the selected node
 */

export interface ExportNetworkFormData {
    [FILE_NAME]: string;
    [EXPORT_FORMAT]: string;
    [EXPORT_PARAMETERS]: Record<string, any>;
}

const schema = yup.object().shape({
    [FILE_NAME]: yup.string().required(),
    [EXPORT_FORMAT]: yup.string().required('exportStudyErrorMsg'),
    [EXPORT_PARAMETERS]: yup.object().shape({}),
});

const emptyData = () => ({
    [FILE_NAME]: '',
    [EXPORT_FORMAT]: '',
    [EXPORT_PARAMETERS]: {},
});

interface ExportNetworkDialogProps {
    open: boolean;
    onClose: () => void;
    onClick: (nodeUuid: UUID, params: Record<string, any>, selectedFormat: string, fileName: string) => void;
    studyUuid: UUID;
    nodeUuid: UUID;
}

// we check if the param is for extension, if it is, we select all possible values by default.
// the only way for the moment to check if the param is for extension, is by checking his type is name.
// TODO to be removed when extensions param default value corrected in backend to include all possible values
function getDefaultValuesForExtensionsParameter(parameters: Parameter[]): Parameter[] {
    return parameters.map((parameter) => {
        if (
            parameter.type === STRING_LIST &&
            (parameter.name?.endsWith('included.extensions') || parameter.name?.endsWith('included-extensions'))
        ) {
            parameter.defaultValue = parameter.possibleValues;
        }
        return parameter;
    });
}
interface FlatParametersInputProps {
    name: string;
    parameters?: ExportFormatProperties;
}

function FlatParametersInput({ name, parameters }: Readonly<FlatParametersInputProps>) {
    const [unfolded, setUnfolded] = useState(false);

    const {
        field: { onChange, value },
    } = useController({ name });

    const handleChange = useCallback(
        (paramName: string, newValue: unknown, isInEdition: boolean) => {
            if (!isInEdition) {
                const updatedParams = { ...value, [paramName]: newValue };
                onChange(updatedParams);
            }
        },
        [onChange, value]
    );

    const handleFoldChange = () => {
        setUnfolded((prev) => !prev);
    };

    const metasAsArray: Parameter[] = useMemo(() => {
        return parameters
            ? parameters.parameters.filter((param: Parameter) => !IGNORED_PARAMS.includes(param.name))
            : [];
    }, [parameters]);

    return (
        <>
            <Collapse in={unfolded}>
                <FlatParameters
                    paramsAsArray={metasAsArray}
                    initValues={value}
                    onChange={handleChange}
                    variant="standard"
                    selectionWithDialog={(param) => param?.possibleValues?.length > 10}
                />
            </Collapse>

            <Stack marginTop="0.7em" direction="row" justifyContent="space-between" alignItems="center">
                <Typography
                    component="span"
                    color={parameters ? 'text.main' : 'text.disabled'}
                    sx={{ fontWeight: 'bold' }}
                >
                    <FormattedMessage id="parameters" />
                </Typography>
                <IconButton onClick={handleFoldChange} disabled={!parameters}>
                    {unfolded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Stack>
        </>
    );
}

export function ExportNetworkDialog({
    open,
    onClose,
    onClick,
    studyUuid,
    nodeUuid,
}: Readonly<ExportNetworkDialogProps>) {
    const [formatsWithParameters, setFormatsWithParameters] = useState<Record<string, ExportFormatProperties>>({});
    const { snackError } = useSnackMessage();
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    const nodeName = useMemo(() => treeNodes?.find((node) => node.id === nodeUuid)?.data.label, [treeNodes, nodeUuid]);

    const methods = useForm<ExportNetworkFormData>({
        defaultValues: emptyData(),
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    // fetch study name to build default file name
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
            if (data[FILE_NAME] && data[EXPORT_FORMAT]) {
                onClick(nodeUuid, data[EXPORT_PARAMETERS], data[EXPORT_FORMAT], data[FILE_NAME]);
            }
        },
        [nodeUuid, onClick]
    );

    const exportValue = useWatch({ name: EXPORT_FORMAT, control: methods.control });

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
                    name={EXPORT_FORMAT}
                    label="exportFormat"
                    options={Object.keys(formatsWithParameters)}
                    size="small"
                />
                <FlatParametersInput name={EXPORT_PARAMETERS} parameters={formatsWithParameters?.[exportValue]} />
            </Box>
        </CustomMuiDialog>
    );
}
