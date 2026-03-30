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
    snackWithFallback,
    TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { insertCompositeModifications } from '../../services/study';
import { FunctionComponent, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer.type';
import { CompositeModificationAction } from 'components/graph/menus/network-modifications/network-modification-menu.type';
import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    Grid,
    Radio,
    RadioGroup,
    TextField,
    Typography,
} from '@mui/material';
import { NoteAlt as NoteAltIcon } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { ModificationDialog } from './commons/modificationDialog';
import { ACTION, COMPOSITE_NAMES, SELECTED_MODIFICATIONS } from 'components/utils/field-constants';

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

interface SelectedModification {
    id: string;
    name: string;
}

interface FormData {
    [ACTION]: CompositeModificationAction;
    [SELECTED_MODIFICATIONS]: SelectedModification[];
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
        [ACTION]: yup
            .mixed<CompositeModificationAction>()
            .oneOf(Object.values(CompositeModificationAction))
            .required(),
        [SELECTED_MODIFICATIONS]: yup.array().min(1).required(),
        [COMPOSITE_NAMES]: yup.mixed<Record<string, string>>().when([ACTION], {
            is: CompositeModificationAction.INSERT,
            then: (schema) =>
                schema.test('all-names-filled', 'FieldIsRequired', function (value) {
                    const selections: SelectedModification[] = this.parent[SELECTED_MODIFICATIONS] ?? [];
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
                }),
            otherwise: (schema) => schema.optional(),
        }),
    })
    .required();

type FormSchemaType = yup.InferType<typeof formSchema>;

const ImportModificationDialog: FunctionComponent<ImportModificationDialogProps> = ({ open, onClose }) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

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

    const handleSelectModification = (selectedElements: TreeViewFinderNodeProps[]) => {
        setIsSelectorOpen(false);
        if (!selectedElements.length) return;

        const newSelections = selectedElements.map((e) => ({ id: e.id, name: e.name }));
        setValue(SELECTED_MODIFICATIONS, newSelections, { shouldValidate: true, shouldDirty: true });

        const currentNames = compositeNames ?? {};
        setValue(COMPOSITE_NAMES, Object.fromEntries(newSelections.map((e) => [e.id, currentNames[e.id] ?? e.name])), {
            shouldValidate: true,
        });
    };

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
                    snackWithFallback(snackError, error, { headerId: 'errInsertCompositeModificationMsg' });
                }
            );
            onClose();
        },
        [studyUuid, currentNode, snackError, onClose]
    );

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="sm"
                open={open}
                onClose={onClose}
                onClear={handleClear}
                onSave={handleSave}
                titleId="ModificationsImport"
                disabledSave={!isValid}
            >
                <Grid container spacing={2} direction="column" marginTop="auto">
                    <Grid item>
                        <FormControl>
                            <Controller
                                name={ACTION}
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup row {...field}>
                                        <FormControlLabel
                                            value={CompositeModificationAction.SPLIT}
                                            control={<Radio size="small" />}
                                            label={intl.formatMessage({ id: 'CompositeModificationsActionSplit' })}
                                        />
                                        <FormControlLabel
                                            value={CompositeModificationAction.INSERT}
                                            control={<Radio size="small" />}
                                            label={intl.formatMessage({ id: 'CompositeModificationsActionInsert' })}
                                        />
                                    </RadioGroup>
                                )}
                            />
                        </FormControl>
                    </Grid>
                    <Grid container alignItems="center" item>
                        <Grid item display="flex" marginLeft={1}>
                            <NoteAltIcon />
                        </Grid>
                        <Typography m={1} component="span">
                            <Box fontWeight="fontWeightBold">{selectedModifications.map((m) => m.name).join(', ')}</Box>
                        </Typography>
                        <Grid item>
                            <Button
                                size={selectedModifications.length ? 'small' : 'medium'}
                                onClick={() => setIsSelectorOpen(true)}
                            >
                                <FormattedMessage id={'ChooseModifications'} />
                            </Button>
                        </Grid>
                    </Grid>

                    {isInsertMode && selectedModifications.length > 0 && (
                        <Grid item>
                            <Grid container spacing={1} direction="column">
                                {selectedModifications.map((m) => (
                                    <Grid item key={m.id}>
                                        <Controller
                                            name={`${COMPOSITE_NAMES}.${m.id}`}
                                            control={control}
                                            render={({ field, fieldState }) => {
                                                return (
                                                    <TextField
                                                        {...field}
                                                        label={m.name}
                                                        fullWidth
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
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    )}
                </Grid>
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
