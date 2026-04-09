/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage, useIntl } from 'react-intl';
import {
    CustomFormProvider,
    DirectoryItemSelector,
    ElementType,
    RadioInput,
    snackWithFallback,
    TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { insertCompositeModifications } from '../../services/study';
import { JSX, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer.type';
import { CompositeModificationAction } from 'components/graph/menus/network-modifications/network-modification-menu.type';
import { Button, Grid, TextField, Typography } from '@mui/material';
import { NoteAlt as NoteAltIcon } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { ModificationDialog } from './commons/modificationDialog';
import { ACTION, COMPOSITE_NAMES, SELECTED_MODIFICATIONS } from 'components/utils/field-constants';
import GridItem from './commons/grid-item';

/**
 * Dialog to select composite network modifications and append them to the current node.
 * - SPLIT mode: extracts and inserts individual modifications contained in the composites.
 * - INSERT mode: inserts the composite modifications as-is; a name per composite is required.
 *
 * The composite selection is presented inline (like RootNetworkCaseSelection):
 * a list icon + selected item names + a button to open the DirectoryItemSelector.
 * Name fields (one per selected item) appear only when INSERT mode is active,
 * and are validated via react-hook-form + yup.
 *
 * @param open     Whether the dialog is open
 * @param onClose  Callback to close the dialog
 */
interface ImportModificationDialogProps {
    open: boolean;
    onClose: () => void;
}

interface SelectedComposite {
    id: string;
    name: string;
}

interface FormData {
    [ACTION]: CompositeModificationAction;
    [SELECTED_MODIFICATIONS]: SelectedComposite[];
    [COMPOSITE_NAMES]: Record<string, string>;
}

const emptyFormData: FormData = {
    [ACTION]: CompositeModificationAction.SPLIT,
    [SELECTED_MODIFICATIONS]: [],
    [COMPOSITE_NAMES]: {},
};

const formSchema = yup
    .object()
    .shape({
        [ACTION]: yup.mixed<CompositeModificationAction>().oneOf(Object.values(CompositeModificationAction)).required(),
        [SELECTED_MODIFICATIONS]: yup.array().min(1).required(),
        [COMPOSITE_NAMES]: yup.mixed<Record<string, string>>().when(ACTION, ([action], schema) => {
            if (action === CompositeModificationAction.INSERT) {
                return schema.test('all-names-filled', 'FieldIsRequired', function (value) {
                    const selections: SelectedComposite[] = this.parent[SELECTED_MODIFICATIONS] ?? [];
                    for (const m of selections) {
                        const name = value?.[m.id] ?? '';
                        if (!name.trim()) {
                            return this.createError({
                                path: `${COMPOSITE_NAMES}.${m.id}`,
                                message: 'FieldIsRequired',
                            });
                        }
                    }
                    return true;
                });
            }

            return schema.optional();
        }),
    })
    .required() as yup.ObjectSchema<FormData>;

type FormSchemaType = yup.InferType<typeof formSchema>;

const ImportModificationDialog: ({ open, onClose }: Readonly<ImportModificationDialogProps>) => JSX.Element = ({
    open,
    onClose,
}) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    const [hasConfirmedFirstSelection, setHasConfirmedFirstSelection] = useState(false);
    useEffect(() => {
        if (open) {
            setIsSelectorOpen(true);
        }
    }, [open]);

    const formMethods = useForm<FormSchemaType>({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const {
        control,
        reset,
        watch,
        setValue,
        formState: { isValid },
    } = formMethods;

    const action = watch(ACTION);
    const selectedModifications = watch(SELECTED_MODIFICATIONS);
    const compositeNames = watch(COMPOSITE_NAMES);
    const isInsertMode = action === CompositeModificationAction.INSERT;

    const handleOpenSelector = useCallback(() => {
        setIsSelectorOpen(true);
    }, []);

    const handleSelectModification = useCallback(
        (selectedElements: TreeViewFinderNodeProps[]) => {
            setIsSelectorOpen(false);

            if (!selectedElements.length) {
                // Cancel before any confirmed selection -> close the whole dialog.
                if (!hasConfirmedFirstSelection) {
                    onClose();
                }
                return;
            }

            setHasConfirmedFirstSelection(true);
            const newSelections = selectedElements.map((e) => ({ id: e.id, name: e.name }));
            setValue(SELECTED_MODIFICATIONS, newSelections, { shouldValidate: true, shouldDirty: true });

            const currentNames = compositeNames ?? {};
            setValue(
                COMPOSITE_NAMES,
                Object.fromEntries(newSelections.map((e) => [e.id, currentNames[e.id] ?? e.name])),
                { shouldValidate: true }
            );
        },
        [hasConfirmedFirstSelection, compositeNames, onClose, setValue]
    );

    const handleClear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const handleSave = useCallback(
        (values: FormData) => {
            if (!studyUuid || !currentNode) return;
            const modificationsToInsert: { first: string; second: string }[] = values[SELECTED_MODIFICATIONS].map(
                (m) => ({ first: m.id, second: values[COMPOSITE_NAMES][m.id] ?? m.name })
            );
            insertCompositeModifications(studyUuid, currentNode.id, modificationsToInsert, values[ACTION]).catch(
                (error) => {
                    snackWithFallback(snackError, error, { headerId: 'importComposites.error' });
                }
            );
            onClose();
        },
        [studyUuid, currentNode, snackError, onClose]
    );

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                open={open}
                onClose={onClose}
                onClear={handleClear}
                onSave={handleSave}
                titleId="importComposites.title"
                disabledSave={!isValid}
                PaperProps={{ sx: { minWidth: '50%' } }}
                sx={{ visibility: hasConfirmedFirstSelection ? 'visible' : 'hidden' }}
            >
                <Grid container spacing={2} marginTop="auto" sx={{ alignItems: 'center' }}>
                    <GridItem size={12}>
                        <Button size="medium" onClick={handleOpenSelector}>
                            <NoteAltIcon />
                            <FormattedMessage id={'importComposites.select'} />
                        </Button>
                    </GridItem>
                    <GridItem size={4}>
                        <FormattedMessage id="importComposites.label" />
                    </GridItem>
                    <GridItem size={8}>
                        <RadioInput
                            name={ACTION}
                            options={[
                                {
                                    id: CompositeModificationAction.SPLIT,
                                    label: 'importComposites.action.split',
                                },
                                {
                                    id: CompositeModificationAction.INSERT,
                                    label: 'importComposites.action.insert',
                                },
                            ]}
                        />
                    </GridItem>
                </Grid>
                {selectedModifications.length > 0 && (
                    <Grid container spacing={1} direction="column" sx={{ padding: 2 }}>
                        <FormattedMessage id="importComposites.selected" />
                        {selectedModifications.map((m) => (
                            <GridItem key={m.id}>
                                {isInsertMode ? (
                                    <Controller
                                        name={`${COMPOSITE_NAMES}.${m.id}`}
                                        control={control}
                                        render={({ field, fieldState }) => {
                                            return (
                                                <TextField
                                                    {...field}
                                                    label={m.name}
                                                    required
                                                    size="small"
                                                    error={!!fieldState.error}
                                                    helperText={
                                                        fieldState.error
                                                            ? intl.formatMessage({ id: 'FieldIsRequired' })
                                                            : undefined
                                                    }
                                                />
                                            );
                                        }}
                                    />
                                ) : (
                                    <Typography variant="body1" component="span" fontWeight="fontWeightMedium">
                                        {m.name}
                                    </Typography>
                                )}
                            </GridItem>
                        ))}
                    </Grid>
                )}
            </ModificationDialog>

            <DirectoryItemSelector
                open={isSelectorOpen}
                onClose={handleSelectModification}
                types={[ElementType.MODIFICATION]}
                multiSelect={true}
                title={intl.formatMessage({ id: 'ModificationsSelection' })}
            />
        </CustomFormProvider>
    );
};

export default ImportModificationDialog;
