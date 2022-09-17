import { Connection, Keypair, clusterApiUrl, Cluster, PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "../helpers/account";
import { getTokenAccountBalance } from "../helpers/solana-rpc";

require('dotenv').config({path:'../config/.env'});

export class BurnFreeNft {
    private connection: Connection;
    private privateKeyBit: string;
    private privateKey: Uint8Array;
    private wallet: Keypair;
    private nodeEndpoint: string;

    constructor(privateKey: string) {
        if (!process.env.NETWORK || !process.env.NODE_ENDPOINT) {
            throw('Environement variable incorrect');
        }

        this.nodeEndpoint = process.env.NODE_ENDPOINT;
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
        
        if (!emptyAssociatedTokenAccount) {
            console.log(`Cannot find associated token account`);
            return;
        }

        const tokenAccountBalance = await getTokenAccountBalance(emptyAssociatedTokenAccount.toString(), this.nodeEndpoint);
        console.log(tokenAccountBalance);
    }
}