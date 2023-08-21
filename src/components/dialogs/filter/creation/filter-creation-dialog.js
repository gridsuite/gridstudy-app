// /**
//  * Copyright (c) 2022, RTE (http://www.rte-france.com)
//  * This Source Code Form is subject to the terms of the Mozilla Public
//  * License, v. 2.0. If a copy of the MPL was not distributed with this
//  * file, You can obtain one at http://mozilla.org/MPL/2.0/.
//  */

import CustomMuiDialog from '../custom-mui-dialog';
import NameWrapper from '../name-wrapper';
import { elementType, useSnackMessage } from '@gridsuite/commons-ui';
import RadioInput from 'components/utils/rhf-inputs/radio-input';
import { FILTER_TYPES } from 'components/network/constants';
import {
    EQUIPMENT_TYPE,
    FILTER_TYPE,
    NAME,
} from 'components/utils/field-constants';
import CriteriaBasedFilterForm, {
    criteriaBasedFilterEmptyFormData,
    criteriaBasedFilterSchema,
} from './criteria-based/criteria-based-filter-form';
import ExplicitNamingFilterForm, {
    FILTER_EQUIPMENTS_ATTRIBUTES,
    explicitNamingFilterEmptyFormData,
    explicitNamingFilterSchema,
} from './explicit-naming/explicit-naming-filter-form';
import yup from 'components/utils/yup-config';
import { useSelector } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    saveCriteriaBasedFilter,
    saveExplicitNamingFilter,
} from '../filters-save';
import PropTypes from 'prop-types';
import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import DirectoryItemSelector from 'components/directory-item-selector';
import { useIntl } from 'react-intl/lib';
import { fetchPath } from 'services/directory';

const emptyFormData = {
    [NAME]: null,
    [FILTER_TYPE]: FILTER_TYPES.EXPLICIT_NAMING.id,
    [EQUIPMENT_TYPE]: null,
    ...criteriaBasedFilterEmptyFormData,
    ...explicitNamingFilterEmptyFormData,
};

// we use both schemas then we can change the type of filter without losing the filled form fields
const formSchema = yup
    .object()
    .shape({
        [NAME]: yup.string().required(),
        [FILTER_TYPE]: yup.string().required(),
        [EQUIPMENT_TYPE]: yup.string().required(),
        ...criteriaBasedFilterSchema,
        ...explicitNamingFilterSchema,
    })
    .required();

const CreateFilterDialog = ({ open, onClose }) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const [defaultFolder, setDefaultFolder] = useState({
        id: null,
        name: null,
    });
    const [filterNameValid, setFilterNameValid] = useState(false);
    const [openDirectoryFolders, setOpenDirectoryFolders] = useState(false);
    const [isChoosedFolderChanged, setIsChoosedFolderChanged] = useState(false);
    const studyUuid = useSelector((state) => state.studyUuid);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { setValue, watch } = formMethods;
    const filterType = watch(FILTER_TYPE);

    const handleNameChange = (isValid, newName) => {
        setFilterNameValid(isValid);
        setValue(NAME, newName);
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

    useEffect(() => {
        if (studyUuid) {
            fetchDefaultDirectoryForStudy();
        }
    }, [fetchDefaultDirectoryForStudy, studyUuid]);

    const onSubmit = useCallback(
        (filterForm) => {
            if (filterForm[FILTER_TYPE] === FILTER_TYPES.EXPLICIT_NAMING.id) {
                saveExplicitNamingFilter(
                    filterForm[FILTER_EQUIPMENTS_ATTRIBUTES],
                    true,
                    filterForm[EQUIPMENT_TYPE],
                    filterForm[NAME],
                    null,
                    (error) => {
                        snackError({
                            messageTxt: error,
                        });
                    },
                    defaultFolder.id,
                    onClose
                );
            } else if (
                filterForm[FILTER_TYPE] === FILTER_TYPES.CRITERIA_BASED.id
            ) {
                saveCriteriaBasedFilter(
                    filterForm,
                    defaultFolder.id,
                    onClose,
                    (error) => {
                        snackError({
                            messageTxt: error,
                        });
                    }
                );
            }
        },
        [defaultFolder.id, onClose, snackError]
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
        <CustomMuiDialog
            open={open}
            onClose={onClose}
            onSave={onSubmit}
            formSchema={formSchema}
            formMethods={formMethods}
            titleId={'createNewFilter'}
            removeOptional={true}
            disabledSave={!filterNameValid}
        >
            <NameWrapper
                titleMessage="Name"
                contentType={elementType.FILTER}
                handleNameValidation={handleNameChange}
                activeDirectory={defaultFolder.id}
                isChoosedFolderChanged={isChoosedFolderChanged}
            >
                <Grid container spacing={2} marginTop={'auto'}>
                    {folderChooser}
                    <Grid item>
                        <RadioInput
                            name={FILTER_TYPE}
                            options={Object.values(FILTER_TYPES)}
                        />
                    </Grid>

                    {filterType === FILTER_TYPES.CRITERIA_BASED.id ? (
                        <CriteriaBasedFilterForm />
                    ) : (
                        <ExplicitNamingFilterForm />
                    )}
                </Grid>
            </NameWrapper>
            <DirectoryItemSelector
                open={openDirectoryFolders}
                onClose={setSelectedFolder}
                types={[]}
                title={intl.formatMessage({ id: 'chooseFolder' })}
                onlyLeaves={false}
                multiselect={false}
            />
        </CustomMuiDialog>
    );
};

CreateFilterDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default CreateFilterDialog;
