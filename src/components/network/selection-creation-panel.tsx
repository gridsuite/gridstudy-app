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
    FILTER_EQUIPMENTS,
    SelectInput,
    FormEquipment,
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
    equipmentTypeToLabel,
    EQUIPMENT_TYPES,
} from '../utils/equipment-types';
import { UUID } from 'crypto';
import { fetchDirectoryElementPath } from '@gridsuite/commons-ui';
import CircularProgress from '@mui/material/CircularProgress';
import FolderOutlined from '@mui/icons-material/FolderOutlined';
import { AppState } from 'redux/reducer';
import {
    SELECTION_TYPES,
    selectionTypeToLabel,
} from 'components/utils/selection-types';
import { useSaveMap } from './use-save-map';

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
    getEquipments: (equipmentType: string) => [];
    onCancel: () => void;
    nominalVoltages: number[];
};

const SelectionCreationPanel: React.FC<SelectionCreationPanelProps> = ({
    getEquipments,
    onCancel,
    nominalVoltages,
}) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const [openDirectorySelector, setOpenDirectorySelector] = useState(false);
    const intl = useIntl();
    const { pendingState, onSaveSelection } = useSaveMap();
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const {
        formState: { errors },
    } = formMethods;
    const watchSelectionType = useWatch({
        name: SELECTION_TYPE,
        control: formMethods.control,
    });

    const [destinationFolder, setDestinationFolder] =
        useState<TreeViewFinderNodeProps>();

    const fetchDefaultDirectoryForStudy = useCallback(() => {
        // @ts-expect-error TODO: manage null case
        fetchDirectoryElementPath(studyUuid).then((res) => {
            if (res) {
                const parentFolderIndex = res.length - 2;
                setDestinationFolder({
                    id: res[parentFolderIndex].elementUuid,
                    name: res[parentFolderIndex].elementName,
                });
            }
        });
    }, [studyUuid]);

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
            if (folder[0].id !== destinationFolder?.id) {
                setDestinationFolder({
                    id: folder[0].id,
                    name: folder[0].name,
                });
            }
        }
        setOpenDirectorySelector(false);
    };
    const equipmentTypesOptions = useMemo(() => {
        if (watchSelectionType === SELECTION_TYPES.FILTER) {
            return Object.values(FILTER_EQUIPMENTS).map(
                (equipment: FormEquipment) => {
                    return {
                        id: equipment.id,
                        label: equipment.label,
                    };
                }
            );
        } else {
            // might be better to use CONTINGENCY_LIST_EQUIPMENTS from commons ui once the list is finalised
            const equipmentTypesToExclude = new Set([
                EQUIPMENT_TYPES.SWITCH,
                EQUIPMENT_TYPES.BUS,
                EQUIPMENT_TYPES.HVDC_CONVERTER_STATION,
            ]);
            return Object.values(EQUIPMENT_TYPES)
                .filter(
                    (equipmentType) =>
                        !equipmentTypesToExclude.has(equipmentType)
                )
                .map((value) => {
                    return {
                        id: value,
                        label: equipmentTypeToLabel(value),
                    };
                });
        }
    }, [watchSelectionType]);

    const handleSubmit = () => {
        formMethods.trigger().then((isValid) => {
            if (isValid && destinationFolder) {
                const formData = formMethods.getValues() as ISelectionCreation;
                onSaveSelection(
                    getEquipments(formData.equipmentType),
                    formMethods.getValues() as ISelectionCreation,
                    destinationFolder,
                    nominalVoltages
                ).then((result) => {
                    if (result) {
                        formMethods.setValue(NAME, '', {
                            shouldDirty: true,
                        });
                    }
                });
            }
        });
    };
    const filterSelected = watchSelectionType === SELECTION_TYPES.FILTER;
    const nameError = errors[NAME];
    const isValidating = errors.root?.isValidating;
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
                            disabled={pendingState}
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
                                    disabled={pendingState}
                                />
                            </Grid>

                            <Grid container>
                                <UniqueNameInput
                                    name={NAME}
                                    label={'Name'}
                                    elementType={
                                        filterSelected
                                            ? ElementType.FILTER
                                            : ElementType.CONTINGENCY_LIST
                                    }
                                    activeDirectory={
                                        destinationFolder?.id as UUID
                                    }
                                    autoFocus
                                    formProps={{
                                        variant: 'standard',
                                        disabled: pendingState,
                                    }}
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
                                            &nbsp;{destinationFolder?.name}
                                            &nbsp;
                                        </span>
                                    </Box>
                                </Typography>
                                <Button
                                    onClick={handleChangeFolder}
                                    variant="contained"
                                    size="small"
                                    disabled={pendingState}
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
                        disabled={
                            !formMethods.formState.isDirty ||
                            pendingState ||
                            !!nameError ||
                            !!isValidating
                        }
                        onClick={handleSubmit}
                        size={'large'}
                    >
                        {(pendingState && <CircularProgress size={24} />) || (
                            <FormattedMessage id="save" />
                        )}
                    </Button>
                </Grid>
            </Box>
        </CustomFormProvider>
    );
};

export default SelectionCreationPanel;
