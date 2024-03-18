/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NAME } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import { useSelector } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm, UseFormGetValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { fetchPath } from 'services/directory';
import { DirectoryItemSelector } from '@gridsuite/commons-ui';
import ModificationDialog from 'components/dialogs/commons/modificationDialog';
import { createParameter } from 'services/explore';
import { Identifier, VoltageInitForm } from '../voltageinit/voltage-init-utils';
import { UniqueNameInput } from 'components/dialogs/commons/unique-name-input';
import { ReduxState } from 'redux/reducer.type';
import { ElementType } from '@gridsuite/commons-ui';
import { fetchDirectoryContent, fetchRootFolders } from 'services/directory';
import { fetchElementsMetadata } from 'services/explore';

interface FormData {
    [NAME]: string;
}

interface CreateParameterProps {
    open: boolean;
    onClose: () => void;
    parameterValues: UseFormGetValues<VoltageInitForm> | any;
    parameterType: string;
    parameterFormatter: (newParams: any) => any;
}

const emptyFormData = {
    [NAME]: '',
};

const formSchema = yup
    .object()
    .shape({
        [NAME]: yup.string().trim().required(),
    })
    .required();

const CreateParameterDialog: React.FunctionComponent<CreateParameterProps> = ({
    open,
    onClose,
    parameterValues,
    parameterType,
    parameterFormatter,
}) => {
    const intl = useIntl();
    const [defaultFolder, setDefaultFolder] = useState<Identifier>({
        id: null,
        name: null,
    });
    const [openDirectoryFolders, setOpenDirectoryFolders] = useState(false);
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const {
        reset,
        formState: { errors },
    } = formMethods;

    const nameError = errors[NAME];

    const fetchDefaultDirectoryForStudy = useCallback(() => {
        fetchPath(studyUuid).then((res) => {
            if (res) {
                setDefaultFolder({
                    id: res[1].elementUuid,
                    name: res[1].elementName,
                });
            }
        });
    }, [studyUuid]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    useEffect(() => {
        if (studyUuid) {
            fetchDefaultDirectoryForStudy();
        }
    }, [fetchDefaultDirectoryForStudy, studyUuid]);

    const onSubmit = useCallback(
        (values: FormData) => {
            if (defaultFolder.id) {
                createParameter(
                    parameterFormatter(parameterValues()),
                    values.name,
                    parameterType,
                    defaultFolder.id
                );
            }
        },
        [defaultFolder.id, parameterType, parameterValues, parameterFormatter]
    );

    const handleChangeFolder = () => {
        setOpenDirectoryFolders(true);
    };

    const setSelectedFolder = (folder: Identifier[]) => {
        if (folder && folder.length > 0) {
            if (folder[0].id !== defaultFolder?.id) {
                setDefaultFolder({
                    id: folder[0].id,
                    name: folder[0].name,
                });
            }
        }
        setOpenDirectoryFolders(false);
    };

    const folderChooser = (
        <Grid container item>
            <Grid item>
                <Button onClick={handleChangeFolder} variant="contained">
                    <FormattedMessage id={'showSelectDirectoryDialog'} />
                </Button>
            </Grid>
            <Typography m={1} component="span">
                <Box fontWeight={'fontWeightBold'}>
                    {defaultFolder == null ? (
                        <CircularProgress />
                    ) : (
                        defaultFolder.name
                    )}
                </Box>
            </Typography>
        </Grid>
    );

    return (
        <FormProvider {...formMethods}>
            <ModificationDialog
                fullWidth
                open={open}
                onClose={onClose}
                onClear={clear}
                onSave={onSubmit}
                titleId={'saveParameters'}
                disabledSave={!!nameError}
                maxWidth={'sm'}
            >
                <UniqueNameInput
                    name={NAME}
                    label={'Name'}
                    elementType={parameterType}
                    activeDirectory={defaultFolder.id}
                    autoFocus
                />
                {folderChooser}

                <DirectoryItemSelector
                    open={openDirectoryFolders}
                    onClose={setSelectedFolder}
                    types={[ElementType.DIRECTORY]}
                    onlyLeaves={false}
                    multiselect={false}
                    validationButtonText={intl.formatMessage({
                        id: 'validate',
                    })}
                    title={intl.formatMessage({
                        id: 'showSelectDirectoryDialog',
                    })}
                    fetchDirectoryContent={fetchDirectoryContent}
                    fetchRootFolders={fetchRootFolders}
                    fetchElementsInfos={fetchElementsMetadata}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

export default CreateParameterDialog;
