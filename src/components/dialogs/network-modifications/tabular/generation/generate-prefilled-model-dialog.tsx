/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Grid } from '@mui/material';
import {
    CustomFormProvider,
    DirectoryItemsInput,
    ElementType,
    ErrorInput,
    FieldErrorAlert,
    SwitchInput,
} from '@gridsuite/commons-ui';
import { getPrefilledColumnGroups, PrefilledColumnGroup } from './prefillable-columns-config';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    emptyFormData,
    GeneratePrefilledModelDialogProps,
    getPrefilledModelSchema,
    PrefilledModelFormType,
    PrefilledModelGenerationParams,
    RESTRICT_BY_FILTER,
    SELECTED_COLUMN_GROUPS,
    SELECTED_FILTERS,
    styles,
    USE_CURRENT_GRID_STATE,
} from './utils';
import { ModificationDialogContent } from 'components/dialogs/commons/modification-dialog-content';

export default function GeneratePrefilledModelDialog({
    open,
    equipmentType,
    onGenerate,
}: Readonly<GeneratePrefilledModelDialogProps>) {
    const intl = useIntl();

    const schema = useMemo(() => getPrefilledModelSchema(), []);

    const formMethods = useForm<PrefilledModelFormType>({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset, setValue, getValues, handleSubmit } = formMethods;

    const restrictByFilter = useWatch({ control: formMethods.control, name: RESTRICT_BY_FILTER });
    const useCurrentGridState = useWatch({ control: formMethods.control, name: USE_CURRENT_GRID_STATE });
    const selectedColumnGroups = useWatch({ control: formMethods.control, name: SELECTED_COLUMN_GROUPS });

    const availableColumnGroups = useMemo(() => getPrefilledColumnGroups(equipmentType), [equipmentType]);

    const allColumnGroupIds = useMemo(
        () => availableColumnGroups.map((group) => group.labelId),
        [availableColumnGroups]
    );

    const isAllSelected = useMemo(
        () => allColumnGroupIds.length > 0 && selectedColumnGroups?.length === allColumnGroupIds.length,
        [allColumnGroupIds, selectedColumnGroups]
    );

    useEffect(() => {
        if (open.value) {
            reset(emptyFormData);
        }
    }, [open.value, reset]);

    const closeAndClear = useCallback(() => {
        open.setFalse();
        reset(emptyFormData);
    }, [open, reset]);

    const handleColumnGroupToggle = useCallback(
        (labelId: string) => {
            const current = getValues(SELECTED_COLUMN_GROUPS) ?? [];
            const isSelected = current.includes(labelId);

            if (isSelected) {
                setValue(
                    SELECTED_COLUMN_GROUPS,
                    current.filter((id) => id !== labelId),
                    { shouldValidate: true }
                );
            } else {
                setValue(SELECTED_COLUMN_GROUPS, [...current, labelId], { shouldValidate: true });
            }
        },
        [getValues, setValue]
    );

    const handleSelectAllToggle = useCallback(() => {
        if (isAllSelected) {
            setValue(SELECTED_COLUMN_GROUPS, [], { shouldValidate: true });
        } else {
            setValue(SELECTED_COLUMN_GROUPS, allColumnGroupIds, { shouldValidate: true });
        }
    }, [isAllSelected, allColumnGroupIds, setValue]);

    const handleValidate = useCallback(
        (formData: PrefilledModelFormType) => {
            const params: PrefilledModelGenerationParams = {
                restrictByFilter: formData.restrictByFilter,
                filterIds: formData.selectedFilters.map((filter) => filter.id),
                useCurrentGridState: formData.useCurrentGridState,
                selectedColumnGroups: formData.selectedColumnGroups,
            };
            closeAndClear();
            onGenerate(params);
        },
        [onGenerate, closeAndClear]
    );

    const submitButton = (
        <Button onClick={handleSubmit(handleValidate)} variant="outlined">
            <FormattedMessage id="validate" />
        </Button>
    );

    return (
        <CustomFormProvider validationSchema={schema} {...formMethods}>
            <ModificationDialogContent
                titleId="GeneratePrefilledModel"
                open={open.value}
                closeAndClear={closeAndClear}
                submitButton={submitButton}
                PaperProps={{ sx: styles.dialogContent }}
            >
                <Grid container direction="column" spacing={2}>
                    <Grid item>
                        <Box sx={styles.switchRow}>
                            <SwitchInput name={RESTRICT_BY_FILTER} label="RestrictEquipmentList" />
                        </Box>
                        {restrictByFilter && (
                            <Box sx={styles.filterSelector}>
                                <DirectoryItemsInput
                                    name={SELECTED_FILTERS}
                                    elementType={ElementType.FILTER}
                                    equipmentTypes={[equipmentType]}
                                    label="filter"
                                    titleId="FiltersListsSelection"
                                    allowMultiSelect={true}
                                />
                            </Box>
                        )}
                    </Grid>

                    <Grid item>
                        <Box sx={styles.switchRow}>
                            <SwitchInput name={USE_CURRENT_GRID_STATE} label="CurrentGridState" />
                        </Box>
                        <ErrorInput name={SELECTED_COLUMN_GROUPS} InputField={FieldErrorAlert} />
                        {useCurrentGridState && (
                            <Box sx={styles.columnsContainer}>
                                <FormGroup>
                                    <FormControlLabel
                                        control={<Checkbox checked={isAllSelected} onChange={handleSelectAllToggle} />}
                                        label={intl.formatMessage({ id: 'SelectAll' })}
                                        sx={styles.selectAllLabel}
                                    />
                                    {availableColumnGroups.map((group: PrefilledColumnGroup) => (
                                        <FormControlLabel
                                            key={group.labelId}
                                            control={
                                                <Checkbox
                                                    checked={selectedColumnGroups?.includes(group.labelId)}
                                                    onChange={() => handleColumnGroupToggle(group.labelId)}
                                                />
                                            }
                                            label={intl.formatMessage({ id: group.labelId })}
                                        />
                                    ))}
                                </FormGroup>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </ModificationDialogContent>
        </CustomFormProvider>
    );
}
