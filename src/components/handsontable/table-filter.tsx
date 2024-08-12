import { CustomMuiDialog, yup } from '@gridsuite/commons-ui';
import { Resolver, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Grid } from '@mui/material';
import { QueryBuilderMaterial } from '@react-querybuilder/material';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import * as ReactDnD from 'react-dnd';
import * as ReactDndHtml5Backend from 'react-dnd-html5-backend';

export interface FilterCreationDialogProps {
    open: boolean;
    onClose: () => void;
}

const formSchema = yup.object().shape({}).required();

export function FilterTableDialog({
    open,
    onClose,
}: FilterCreationDialogProps) {
    const formMethods = useForm({
        defaultValues: {},
        resolver: yupResolver(formSchema) as unknown as Resolver,
    });

    const {
        formState: { errors },
    } = formMethods;

    return (
        <CustomMuiDialog
            open={open}
            onClose={onClose}
            onSave={() => {}}
            formSchema={formSchema}
            formMethods={formMethods}
            titleId={'createNewFilter'}
            removeOptional
        >
            <Grid item xs={12}>
                <QueryBuilderMaterial>
                    <QueryBuilderDnD
                        dnd={{ ...ReactDnD, ...ReactDndHtml5Backend }}
                    >
                        {/*<QueryBuilder
                            fields={fields}
                            query={query}
                            addRuleToNewGroups
                            combinators={combinators}
                            onQueryChange={handleQueryChange}
                            getOperators={(fieldName) =>
                                getOperators(fieldName, intl)
                            }
                            validator={queryValidator}
                            controlClassnames={{
                                queryBuilder: 'queryBuilder-branches',
                            }}
                            controlElements={{
                                addRuleAction: RuleAddButton,
                                addGroupAction: GroupAddButton,
                                combinatorSelector: CombinatorSelector,
                                removeRuleAction: RemoveButton,
                                removeGroupAction: RemoveButton,
                                valueEditor: ValueEditor,
                                operatorSelector: ValueSelector,
                                fieldSelector: ValueSelector,
                                valueSourceSelector: ValueSelector,
                            }}
                            listsAsArrays
                        />*/}
                    </QueryBuilderDnD>
                </QueryBuilderMaterial>
            </Grid>
        </CustomMuiDialog>
    );
}
