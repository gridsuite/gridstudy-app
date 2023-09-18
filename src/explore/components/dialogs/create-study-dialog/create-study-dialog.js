/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useForm } from 'react-hook-form';
import { Grid } from '@mui/material';
import { useIntl } from 'react-intl';
import React, { useCallback, useEffect } from 'react';
import UploadNewCase from '../commons/upload-new-case';
import {
    createStudy,
    deleteCase,
    getCaseImportParameters,
} from '../../../utils/rest-api';
import {
    HTTP_CONNECTION_FAILED_MESSAGE,
    HTTP_UNPROCESSABLE_ENTITY_STATUS,
} from '../../../utils/UIconstants';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useDispatch, useSelector } from 'react-redux';
import ImportParametersSection from './importParametersSection';
import { ElementType } from '../../../utils/elementType';
import DirectorySelect from './directory-select';
import { isObjectEmpty, keyGenerator } from '../../../utils/functions';
import {
    addUploadingElement,
    removeUploadingElement,
    setActiveDirectory,
} from '../../../../redux/actions';
import {
    createStudyDialogFormValidationSchema,
    getCreateStudyDialogFormDefaultValues,
} from './create-study-dialog-utils';
import {
    API_CALL,
    CASE_FILE,
    CASE_NAME,
    CASE_UUID,
    DESCRIPTION,
    FORMATTED_CASE_PARAMETERS,
    STUDY_NAME,
} from '../../utils/field-constants';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import CustomMuiDialog from '../commons/custom-mui-dialog/custom-mui-dialog';
import { ErrorInput, FieldErrorAlert, TextInput } from '@gridsuite/commons-ui';
import PrefilledNameInput from '../commons/prefilled-name-input';

const STRING_LIST = 'STRING_LIST';

const CreateStudyDialog = ({ open, onClose, providedExistingCase }) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const dispatch = useDispatch();

    const activeDirectory = useSelector((state) => state.activeDirectory);
    const selectedDirectory = useSelector((state) => state.selectedDirectory);
    const userId = useSelector((state) => state.user.profile.sub);

    const { elementUuid, elementName } = providedExistingCase || {};

    const createStudyFormMethods = useForm({
        defaultValues: getCreateStudyDialogFormDefaultValues({
            directory: activeDirectory,
            studyName: elementName,
            caseFile: providedExistingCase,
            caseUuid: elementUuid,
        }),
        resolver: yupResolver(createStudyDialogFormValidationSchema),
    });

    const {
        setValue,
        formState: { errors, isValid },
        setError,
        getValues,
    } = createStudyFormMethods;

    const isFormValid = isObjectEmpty(errors) && isValid;

    // callbacks
    const handleApiCallError = useCallback(
        (error) => {
            if (error.status === HTTP_UNPROCESSABLE_ENTITY_STATUS) {
                setError(`root.${API_CALL}`, {
                    type: 'invalidFormatOrName',
                    message: intl.formatMessage({ id: 'invalidFormatOrName' }),
                });
            } else if (error.message.includes(HTTP_CONNECTION_FAILED_MESSAGE)) {
                setError(`root.${API_CALL}`, {
                    type: 'serverConnectionFailed',
                    message: intl.formatMessage({
                        id: 'serverConnectionFailed',
                    }),
                });
            } else {
                setError(`root.${API_CALL}`, {
                    type: 'apiCall',
                    message: error.message,
                });
            }
        },
        [intl, setError]
    );

    const getCurrentCaseImportParams = useCallback(
        (uuid) => {
            getCaseImportParameters(uuid)
                .then((result) => {
                    // sort possible values alphabetically to display select options sorted
                    result.parameters = result.parameters?.map((parameter) => {
                        parameter.possibleValues =
                            parameter.possibleValues?.sort((a, b) =>
                                a.localeCompare(b)
                            );
                        // we check if the param is for extension, if it is, we select all possible values by default.
                        // the only way for the moment to check if the param is for extension, is by checking his name.
                        //TODO to be removed when extensions param default value corrected in backend to include all possible values
                        if (
                            parameter.type === STRING_LIST &&
                            parameter.name?.endsWith('extensions')
                        ) {
                            parameter.defaultValue = parameter.possibleValues;
                        }
                        return parameter;
                    });

                    setValue(FORMATTED_CASE_PARAMETERS, result.parameters, {
                        shouldDirty: true,
                    });
                })
                .catch(() => {
                    setValue(FORMATTED_CASE_PARAMETERS, []);
                    setError(`root.${API_CALL}`, {
                        type: 'parameterLoadingProblem',
                        message: intl.formatMessage({
                            id: 'parameterLoadingProblem',
                        }),
                    });
                });
        },
        [intl, setError, setValue]
    );

    // Methods
    const handleDeleteCase = () => {
        const caseUuid = getValues(CASE_UUID);
        // if we cancel case creation, we need to delete the associated newly created case (if we created one)
        if (caseUuid && !providedExistingCase) {
            deleteCase(caseUuid).catch(handleApiCallError);
        }
    };

    const handleCreateNewStudy = ({
        caseUuid,
        studyName,
        description,
        currentParameters,
        directory,
    }) => {
        if (!caseUuid && !providedExistingCase?.elementUuid) {
            setError(CASE_NAME, {
                type: 'custom',
                message: intl.formatMessage({ id: 'caseNameErrorMsg' }),
            });
            return;
        }
        if (!caseUuid && !providedExistingCase) {
            setError(CASE_FILE, {
                type: 'custom',
                message: intl.formatMessage({ id: 'uploadErrorMsg' }),
            });
            return;
        }

        const uploadingStudy = {
            id: keyGenerator(),
            elementName: studyName,
            directory,
            type: ElementType.STUDY,
            owner: userId,
            lastModifiedBy: userId,
            uploading: true,
        };

        createStudy(
            studyName,
            description,
            caseUuid,
            !!providedExistingCase,
            directory,
            currentParameters ? JSON.stringify(currentParameters) : ''
        )
            .then(() => {
                dispatch(setActiveDirectory(selectedDirectory?.elementUuid));
                onClose();
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'studyCreationError',
                    headerValues: {
                        studyName,
                    },
                });
            })
            .finally(() => {
                setValue(CASE_UUID, null);
                dispatch(removeUploadingElement(uploadingStudy));
            });

        dispatch(addUploadingElement(uploadingStudy));
    };

    /* Effects */
    // handle create study from existing case
    useEffect(() => {
        if (providedExistingCase) {
            const { elementUuid } = providedExistingCase;
            getCurrentCaseImportParams(elementUuid);
        }
    }, [getCurrentCaseImportParams, providedExistingCase, setValue]);

    return (
        <CustomMuiDialog
            titleId={'createNewStudy'}
            formSchema={createStudyDialogFormValidationSchema}
            formMethods={createStudyFormMethods}
            removeOptional={true}
            open={open}
            onClose={onClose}
            onSave={handleCreateNewStudy}
            onCancel={handleDeleteCase}
            disabledSave={!isFormValid}
        >
            <Grid container spacing={2} marginTop={'auto'} direction="column">
                <Grid item>
                    <PrefilledNameInput
                        name={STUDY_NAME}
                        label={'nameProperty'}
                        elementType={ElementType.STUDY}
                    />
                </Grid>
                <Grid item>
                    <TextInput
                        name={DESCRIPTION}
                        label={'descriptionProperty'}
                        formProps={{
                            size: 'medium',
                        }}
                    />
                </Grid>
            </Grid>
            {providedExistingCase ? (
                <DirectorySelect types={[ElementType.DIRECTORY]} />
            ) : (
                <UploadNewCase
                    isNewStudyCreation={true}
                    getCurrentCaseImportParams={getCurrentCaseImportParams}
                    handleApiCallError={handleApiCallError}
                />
            )}
            <ImportParametersSection />
            <Grid pt={1}>
                <ErrorInput name={API_CALL} InputField={FieldErrorAlert} />
                <ErrorInput name={CASE_FILE} InputField={FieldErrorAlert} />
            </Grid>
        </CustomMuiDialog>
    );
};

export default CreateStudyDialog;
