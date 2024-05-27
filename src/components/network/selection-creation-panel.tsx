/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import {
    CustomFormProvider,
    DirectoryItemSelector,
    ElementType,
    SelectInput,
    SubmitButton,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { useForm, useWatch } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    EQUIPMENT_TYPE_FIELD,
    NAME,
    SELECTION_TYPE,
} from 'components/utils/field-constants';
import { useSelector } from 'react-redux';
import { TreeViewFinderNodeProps } from '@gridsuite/commons-ui/dist/components/TreeViewFinder/TreeViewFinder';
import { GridSection } from 'components/dialogs/dialogUtils';
import {
    EQUIPMENT_TYPES,
    SELECTION_TYPES,
    equipementTypeToLabel,
    selectionTypeToLabel,
} from 'components/utils/equipment-types';
import {
    fetchDirectoryContent,
    fetchPath,
    fetchRootFolders,
} from 'services/directory';
import { UniqueNameInput } from 'components/dialogs/commons/unique-name-input';
import { UUID } from 'crypto';
import { fetchElementsMetadata } from 'services/explore';

const formSchema = yup.object().shape({
    [NAME]: yup.string().required(),
    [SELECTION_TYPE]: yup.string().nullable().required(),
    [EQUIPMENT_TYPE_FIELD]: yup.string().nullable().required(),
});
const emptyFormData = {
    [NAME]: '',
    [EQUIPMENT_TYPE_FIELD]: '',
    [SELECTION_TYPE]: '',
};
type ISelectionCreation = yup.InferType<typeof formSchema>;

type SelectionCreationPanelProps = {
    onSaveSelection: (
        data: ISelectionCreation,
        distDir: TreeViewFinderNodeProps
    ) => void;
    onCancel: () => void;
};

const SelectionCreationPanel: React.FC<SelectionCreationPanelProps> = ({
    onSaveSelection,
    onCancel,
}) => {
    const studyUuid = useSelector((state: any) => state.studyUuid);
    const [openDirectorySelector, setOpenDirectorySelector] = useState(false);
    const intl = useIntl();
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { handleSubmit, formState } = formMethods;
    const watchSelectionType = useWatch({
        name: SELECTION_TYPE,
        control: formMethods.control,
    });

    const [defaultFolder, setDefaultFolder] =
        useState<TreeViewFinderNodeProps>();

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

    const onSubmit = useCallback(
        (data: ISelectionCreation) => {
            if (defaultFolder) {
                onSaveSelection(data, defaultFolder);
            }
        },
        [defaultFolder, onSaveSelection]
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
                                    formProps={{
                                        style: { fontStyle: 'italic' },
                                    }}
                                />
                            </Grid>

                            <Grid container>
                                <UniqueNameInput
                                    name={NAME}
                                    label={'Name'}
                                    elementType={ElementType.DIRECTORY}
                                    activeDirectory={defaultFolder?.id as UUID}
                                    autoFocus
                                />
                            </Grid>
                            <Grid container>
                                <Button
                                    onClick={handleChangeFolder}
                                    variant="contained"
                                >
                                    <FormattedMessage
                                        id={'showSelectDirectoryDialog'}
                                    />
                                </Button>

                                <Typography m={1} component="span">
                                    <Box fontWeight={'fontWeightBold'}>
                                        {defaultFolder?.name}
                                    </Box>
                                </Typography>
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
                            fetchDirectoryContent={fetchDirectoryContent}
                            fetchRootFolders={fetchRootFolders}
                            fetchElementsInfos={fetchElementsMetadata}
                        />
                    </Grid>
                </Grid>
                <Grid container justifyContent="flex-end">
                    <SubmitButton
                        variant="outlined"
                        onClick={handleSubmit(onSubmit)}
                        disabled={!formState.isValid}
                    >
                        <FormattedMessage id="validate" />
                    </SubmitButton>
                    <Button onClick={onCancel} size={'large'}>
                        {intl.formatMessage({ id: 'cancel' })}
                    </Button>
                    <Box m={1} />
                </Grid>
            </Box>
        </CustomFormProvider>
    );
};

export default SelectionCreationPanel;
