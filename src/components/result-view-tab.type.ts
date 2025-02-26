import ComputingType from './computing-status/computing-type';

export interface IService {
    id: string;
    computingType: ComputingType[];
    displayed: boolean;
    renderResult: React.ReactNode;
}
