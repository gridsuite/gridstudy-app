import { TextEncoder, TextDecoder } from 'util';

// fix for ReferenceError: TextDecoder / TextEncoder is not defined
Object.assign(global, { TextDecoder, TextEncoder });
