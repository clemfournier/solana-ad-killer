import { Connection, Keypair, clusterApiUrl, Cluster, PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "../helpers/account";

require('dotenv').config({path:'../config/.env'});

export class BurnFreeNft {
    private connection: Connection;
    private privateKeyBit: string;
    private privateKey: Uint8Array;
    private wallet: Keypair;


    constructor(privateKey: string) {
        if (!process.env.NETWORK) {
            throw('Environement variable incorrect');
        }

        this.privateKeyBit = privateKey;
        this.privateKey = Uint8Array.from(JSON.parse(this.privateKeyBit));
        this.wallet = Keypair.fromSecretKey(this.privateKey);
        this.connection = new Connection(clusterApiUrl(process.env.NETWORK as Cluster));
    }

    async startProcess() {
        const mint = new PublicKey('HvvAofj9gig9xFMtws6tmn6a1CRf7q2mEVjazSLo5tgu');
        const emptyAssociatedTokenAccount = await getAssociatedTokenAddress(
            mint,
            this.wallet.publicKey);
        console.log(emptyAssociatedTokenAccount?.toString());
    }
}