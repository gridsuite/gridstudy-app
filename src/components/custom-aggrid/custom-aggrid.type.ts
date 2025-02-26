import { DialogMenuProps } from './custom-aggrid-menu';
import { TableSortKeysType } from '../../redux/reducer.type';

export type SortParams = {
    table: TableSortKeysType;
    tab: string;
    isChildren?: boolean;
};

export interface CustomColumnConfigProps extends DialogMenuProps {
    tabIndex: number;
    colId: string;
}
