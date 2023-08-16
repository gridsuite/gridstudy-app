// /**
//  * Copyright (c) 2022, RTE (http://www.rte-france.com)
//  * This Source Code Form is subject to the terms of the Mozilla Public
//  * License, v. 2.0. If a copy of the MPL was not distributed with this
//  * file, You can obtain one at http://mozilla.org/MPL/2.0/.
//  */

import { Grid } from 'ag-grid-community';
import CustomMuiDialog from '../custom-mui-dialog';
import NameWrapper from '../name-wrapper';
import { elementType, useSnackMessage } from '@gridsuite/commons-ui';
import RadioInput from 'components/utils/rhf-inputs/radio-input';
import { FILTER_TYPE } from 'components/network/constants';
import { EQUIPMENT_TYPE, NAME } from 'components/utils/field-constants';
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
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    saveCriteriaBasedFilter,
    saveExplicitNamingFilter,
} from '../filters-save';
import PropTypes from 'prop-types';
// import {
//     Alert,
//     Button,
//     Dialog,
//     DialogActions,
//     DialogContent,
//     DialogTitle,
// } from '@mui/material';
// import { FunctionComponent, useEffect } from 'react';
// import { FormattedMessage } from 'react-intl';
// import { FilterCreationForm } from './filter-creation-form';
// import { useValidNodeName } from 'components/utils/inputs/input-hooks';
// import React from 'react';
// import { useSelector } from 'react-redux';

// type FilterDialogProps = {
//     title: string;
//     open: boolean;
//     onClose: Function;
//     value: string;
//     studyUuid: string;
// };
// export const CreateFilterDialog: FunctionComponent<FilterDialogProps> = (
//     props,
//     context
// ) => {
//     const { title, open, onClose, value, studyUuid } = props;
//     const [triggerReset, setTriggerReset] = React.useState(false);
//     const [nameError, nameField, isNameOK, currentValue] = useValidNodeName({
//         studyUuid,
//         defaultValue: value,
//         triggerReset,
//     });
//     useEffect(() => setTriggerReset(false), []);

//     const handleClose = () => {
//         setTriggerReset(nameField.props.value !== value);
//         onClose();
//     };
//     return (
//         <>
//             <Dialog
//                 fullWidth
//                 maxWidth="sm"
//                 open={open}
//                 onClose={handleClose}
//                 aria-labelledby="dialog-create-filter"
//             >
//                 <DialogTitle>{title}</DialogTitle>
//                 <DialogContent>
//                     {nameField}
//                     {!isNameOK && nameError !== undefined && (
//                         <Alert severity="error">{nameError}</Alert>
//                     )}
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleClose}>
//                         <FormattedMessage id="cancel" />
//                     </Button>
//                     <Button variant="outlined">
//                         <FormattedMessage id="export" />
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </>
//     );
// };

/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const emptyFormData = {
    [NAME]: null,
    [FILTER_TYPE]: FILTER_TYPE.CRITERIA_BASED.id,
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
    const { snackError } = useSnackMessage();
    const activeDirectory = useSelector((state) => state.activeDirectory);
    const [filterNameValid, setFilterNameValid] = useState(false);

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

    const onSubmit = useCallback(
        (filterForm) => {
            if (filterForm[FILTER_TYPE] === FILTER_TYPE.EXPLICIT_NAMING.id) {
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
                    activeDirectory,
                    onClose
                );
            } else if (
                filterForm[FILTER_TYPE] === FILTER_TYPE.CRITERIA_BASED.id
            ) {
                saveCriteriaBasedFilter(
                    filterForm,
                    activeDirectory,
                    onClose,
                    (error) => {
                        snackError({
                            messageTxt: error,
                        });
                    }
                );
            }
        },
        [activeDirectory, snackError, onClose]
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
            {/* <NameWrapper
                titleMessage="Name"
                contentType={elementType.FILTER}
                handleNameValidation={handleNameChange}
            >
                <Grid container spacing={2} marginTop={'auto'}>
                    <Grid item>
                        <RadioInput
                            name={'filterType'}
                            options={Object.values(FILTER_TYPE)}
                        />
                    </Grid>
                    {filterType === FILTER_TYPE.CRITERIA_BASED.id ? (
                        <CriteriaBasedFilterForm />
                    ) : (
                        <ExplicitNamingFilterForm />
                    )}
                </Grid>
            </NameWrapper> */}
        </CustomMuiDialog>
    );
};

CreateFilterDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default CreateFilterDialog;
