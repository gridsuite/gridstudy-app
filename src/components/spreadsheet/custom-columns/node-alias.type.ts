import { UUID } from 'crypto';

export type NodeAlias = {
    id: UUID;
    name: string;
    alias: string;
};
