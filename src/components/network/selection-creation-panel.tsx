/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    CustomFormProvider,
    DirectoryItemSelector,
    ElementType,
    SelectInput,
    TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { useForm, useWatch } from 'react-hook-form';
import {
    NAME,
    EQUIPMENT_TYPE_FIELD,
    SELECTION_TYPE,
} from 'components/utils/field-constants';
import { GridSection } from 'components/dialogs/dialogUtils';
import { FormattedMessage, useIntl } from 'react-intl';
import { UniqueNameInput } from 'components/dialogs/commons/unique-name-input';
import { useSelector } from 'react-redux';
import {
    equipementTypeToLabel,
    EQUIPMENT_TYPES,
} from '../utils/equipment-types';
import { UUID } from 'crypto';
import { fetchDirectoryElementPath } from '@gridsuite/commons-ui';
import CircularProgress from '@mui/material/CircularProgress';
import FolderOutlined from '@mui/icons-material/FolderOutlined';
import { ReduxState } from 'redux/reducer.type';
import {
    SELECTION_TYPES,
    selectionTypeToLabel,
} from 'components/utils/selection-types';

const formSchema = yup
    .object()
    .shape({
        [NAME]: yup.string().required(),
        [SELECTION_TYPE]: yup.string().nullable().required(),
        [EQUIPMENT_TYPE_FIELD]: yup.string().nullable().required(),
    })
    .required();
const emptyFormData = {
    [NAME]: '',
    [EQUIPMENT_TYPE_FIELD]: '',
    [SELECTION_TYPE]: '',
};

type ISelectionCreation = yup.InferType<typeof formSchema>;

type SelectionCreationPanelProps = {
    onSaveSelection: (
        data: ISelectionCreation,
        distDir: TreeViewFinderNodeProps,
        setSavingState: (state: boolean) => void
    ) => void;
    onCancel: () => void;
};

const SelectionCreationPanel: React.FC<SelectionCreationPanelProps> = ({
    onSaveSelection,
    onCancel,
}) => {
    const [savingState, setSavingState] = useState(false);
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const [openDirectorySelector, setOpenDirectorySelector] = useState(false);
    const intl = useIntl();
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const watchSelectionType = useWatch({
        name: SELECTION_TYPE,
        control: formMethods.control,
    });

    const [defaultFolder, setDefaultFolder] =
        useState<TreeViewFinderNodeProps>();

    const fetchDefaultDirectoryForStudy = useCallback(() => {
        fetchDirectoryElementPath(studyUuid).then((res) => {
            if (res) {
                setDefaultFolder({
                    id: res[1].elementUuid,
                    name: res[1].elementName,
                });
            }
        });
    }, [studyUuid]);

    const generateSelectionName = useCallback(
        (selectionType: string) => {
            const selectionName =
                selectionType === SELECTION_TYPES.FILTER
                    ? 'Generated-filter-'
                    : 'Generated-contingency-list-';
            formMethods.setValue(
                NAME,
                selectionName + new Date().toISOString()
            );
        },
        [formMethods]
    );
    useEffect(() => {
        //TODO rerendering : to fix
        if (watchSelectionType !== '') {
            generateSelectionName(watchSelectionType);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchSelectionType]);

    useEffect(() => {
        if (studyUuid) {
            fetchDefaultDirectoryForStudy();
        }
    }, [fetchDefaultDirectoryForStudy, studyUuid]);

    const handleChangeFolder = () => {
        setOpenDirectorySelector(true);
    };
    const setSelectedFolder = (folder: TreeViewFinderNodeProps[]) => {
        if (folder && folder.length > 0) {
            if (folder[0].id !== defaultFolder?.id) {
                setDefaultFolder({
                    id: folder[0].id,
                    name: folder[0].name,
                });
            }
        }
        setOpenDirectorySelector(false);
    };
    const equipmentTypesOptions = useMemo(() => {
        const equipmentTypesToExclude =
            watchSelectionType === SELECTION_TYPES.FILTER
                ? new Set([
                      EQUIPMENT_TYPES.SWITCH,
                      EQUIPMENT_TYPES.BUS,
                      EQUIPMENT_TYPES.HVDC_CONVERTER_STATION,
                      EQUIPMENT_TYPES.BUSBAR_SECTION,
                      EQUIPMENT_TYPES.TIE_LINE,
                  ])
                : new Set([
                      EQUIPMENT_TYPES.SWITCH,
                      EQUIPMENT_TYPES.BUS,
                      EQUIPMENT_TYPES.HVDC_CONVERTER_STATION,
                  ]);

        return Object.values(EQUIPMENT_TYPES)
            .filter(
                (equipmentType) => !equipmentTypesToExclude.has(equipmentType)
            )
            .map((value) => {
                return {
                    id: value,
                    label: equipementTypeToLabel(value),
                };
            });
    }, [watchSelectionType]);

    return (
        <CustomFormProvider
            removeOptional={true}
            validationSchema={formSchema}
            {...formMethods}
        >
            <Box
                p={4}
                display="flex"
                justifyContent="space-between"
                flexDirection="column"
                height="100%"
            >
                <Grid container rowGap={2}>
                    <GridSection title="createNewSelection" />
                    <Grid container>
                        <SelectInput
                            name={SELECTION_TYPE}
                            options={Object.values(SELECTION_TYPES).map(
                                (value) => ({
                                    id: value,
                                    label: selectionTypeToLabel(value),
                                })
                            )}
                            label={SELECTION_TYPE}
                            fullWidth
                            size={'medium'}
                            disableClearable={true}
                            formProps={{ style: { fontStyle: 'italic' } }}
                        />
                    </Grid>
                    {watchSelectionType !== '' && (
                        <>
                            <Grid container>
                                <SelectInput
                                    name={EQUIPMENT_TYPE_FIELD}
                                    options={equipmentTypesOptions}
                                    label={'EquipmentType'}
                                    fullWidth
                                    size={'medium'}
                                    disableClearable={true}
                                />
                            </Grid>

                            <Grid container>
                                <UniqueNameInput
                                    name={NAME}
                                    label={'Name'}
                                    elementType={ElementType.DIRECTORY}
                                    activeDirectory={defaultFolder?.id as UUID}
                                    autoFocus
                                    formProps={{ variant: 'standard' }}
                                />
                            </Grid>
                            <Grid container>
                                {/* icon directory */}

                                <Typography m={1} component="span">
                                    <Box
                                        fontWeight={'fontWeightBold'}
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <FolderOutlined />
                                        <span>
                                            &nbsp;{defaultFolder?.name}&nbsp;
                                        </span>
                                    </Box>
                                </Typography>
                                <Button
                                    onClick={handleChangeFolder}
                                    variant="contained"
                                    size="small"
                                >
                                    <FormattedMessage
                                        id={'button.changeType'}
                                    />
                                </Button>
                            </Grid>
                        </>
                    )}
                    <Grid container>
                        <DirectoryItemSelector
                            open={openDirectorySelector}
                            onClose={setSelectedFolder}
                            types={[ElementType.DIRECTORY]}
                            onlyLeaves={false}
                            multiSelect={false}
                            validationButtonText={intl.formatMessage({
                                id: 'validate',
                            })}
                            title={intl.formatMessage({
                                id: 'showSelectDirectoryDialog',
                            })}
                        />
                    </Grid>
                </Grid>
                <Grid container justifyContent="flex-end">
                    <Button onClick={onCancel} size={'large'}>
                        {intl.formatMessage({
                            id: 'cancel',
                        })}
                    </Button>
                    <Box m={1} />
                    <Button
                        variant="outlined"
                        type={'submit'}
                        disabled={!formMethods.formState.isDirty || savingState}
                        onClick={() => {
                            formMethods.trigger().then((isValid) => {
                                if (isValid && defaultFolder) {
                                    onSaveSelection(
                                        formMethods.getValues() as ISelectionCreation,
                                        defaultFolder,
                                        setSavingState
                                    );
                                }
                            });
                        }}
                        size={'large'}
                    >
                        {(savingState && <CircularProgress size={24} />) || (
                            <FormattedMessage id="save" />
                        )}
                    </Button>
                </Grid>
            </Box>
        </CustomFormProvider>
    );
};

export default SelectionCreationPanel;
