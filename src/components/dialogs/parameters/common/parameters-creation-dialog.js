/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { elementType } from '@gridsuite/commons-ui';
import { NAME } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import { useSelector } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import DirectoryItemSelector from 'components/directory-item-selector';
import { fetchPath } from 'services/directory';
import ModificationDialog from 'components/dialogs/commons/modificationDialog';
import NameWrapper from 'components/dialogs/commons/name-wrapper';
import { createParameter } from 'services/explore';
import { formatNewParams } from '../voltageinit/voltage-init-utils';

const emptyFormData = {
    [NAME]: null,
};

const formSchema = yup
    .object()
    .shape({
        [NAME]: yup.string().required(),
    })
    .required();

const CreateParameterDialog = ({
    open,
    onClose,
    parameterGetValues,
    parameterType,
}) => {
    const intl = useIntl();
    const [defaultFolder, setDefaultFolder] = useState({
        id: null,
        name: null,
    });
    const [parameterNameValid, setParameterNameValid] = useState(false);
    const [openDirectoryFolders, setOpenDirectoryFolders] = useState(false);
    const [isChoosedFolderChanged, setIsChoosedFolderChanged] = useState(false);
    const studyUuid = useSelector((state) => state.studyUuid);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { reset, setValue } = formMethods;

    const handleNameChange = (isValid, newName) => {
        setParameterNameValid(isValid);
        setValue(NAME, newName, { shouldDirty: true });
    };

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
        (values) => {
            createParameter(
                formatNewParams(parameterGetValues()),
                values.name,
                parameterType,
                defaultFolder.id
            );
        },
        [defaultFolder.id, parameterType, parameterGetValues]
    );

    const handleChangeFolder = () => {
        setOpenDirectoryFolders(true);
    };

    const setSelectedFolder = (folder) => {
        if (folder && folder.length > 0) {
            if (folder[0].id !== defaultFolder.id) {
                setDefaultFolder({
                    id: folder[0].id,
                    name: folder[0].name,
                });
                setIsChoosedFolderChanged(true);
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
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                open={open}
                onClose={onClose}
                onClear={clear}
                onSave={onSubmit}
                titleId={'saveParameters'}
                disabledSave={!parameterNameValid}
                maxWidth={'sm'}
            >
                <NameWrapper
                    titleMessage="Name"
                    contentType={parameterType}
                    handleNameValidation={handleNameChange}
                    activeDirectory={defaultFolder.id}
                    isChoosedFolderChanged={isChoosedFolderChanged}
                    setIsChoosedFolderChanged={setIsChoosedFolderChanged}
                >
                    {folderChooser}
                </NameWrapper>

                <DirectoryItemSelector
                    open={openDirectoryFolders}
                    onClose={setSelectedFolder}
                    types={[elementType.DIRECTORY]}
                    title={intl.formatMessage({
                        id: 'showSelectDirectoryDialog',
                    })}
                    onlyLeaves={false}
                    multiselect={false}
                    validationButtonText={intl.formatMessage({
                        id: 'validate',
                    })}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

CreateParameterDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    parameterGetValues: PropTypes.object,
    parameterType: PropTypes.string,
};

export default CreateParameterDialog;
