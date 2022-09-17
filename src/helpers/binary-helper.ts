import bs58 from 'bs58';

export class BinaryHelper {
    constructor() {}
    
    privateKeyToBite(privateKey: string) : string {
        const bytes = bs58.decode(privateKey);
        return JSON.stringify(Array.from(bytes));
    }
}
