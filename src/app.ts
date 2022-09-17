import { BinaryHelper } from "./helpers/binary-helper";
import { BurnFreeNft } from "./services/burnFreeNft";

require('dotenv').config({path:'./config/.env'});

export class SolanaAdKiller {
    private binaryHelper: BinaryHelper;
    private burnFreeNft: BurnFreeNft;
    private privateKey: string;
    private account: string;

    constructor() {
        if (!process.env.PRIVATE_KEY || !process.env.ACCOUNT) {
            throw('Environement variable incorrect');
        }
        
        this.binaryHelper = new BinaryHelper();
        this.privateKey = this.binaryHelper.privateKeyToBite(process.env.PRIVATE_KEY);
        this.burnFreeNft = new BurnFreeNft(this.privateKey);
        this.account = process.env.ACCOUNT;
    }

    async startProcess() : Promise<void> {
        await this.burnFreeNft.startProcess();
    }
}

const solanaAdKiller = new SolanaAdKiller();

solanaAdKiller.startProcess();