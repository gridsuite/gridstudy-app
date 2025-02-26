import { TableSortKeysType } from '../../redux/reducer';
import { DialogMenuProps } from './custom-aggrid-menu';

export type SortParams = {
    table: TableSortKeysType;
    tab: string;
    isChildren?: boolean;
};

export interface CustomColumnConfigProps extends DialogMenuProps {
    tabIndex: number;
    colId: string;
}
