import { ConfirmOptions, Connection, PublicKey, sendAndConfirmTransaction, Signer, Transaction, TransactionInstruction, TransactionSignature } from "@solana/web3.js";
import { TokenInstruction, TOKEN_PROGRAM_ID } from "../constants/solana-constants";
import { addSigners, getSigners } from "./internal";
import { struct, u8 } from '@solana/buffer-layout';

export async function closeAccount(
    connection: Connection,
    payer: Signer,
    account: PublicKey,
    destination: PublicKey,
    authority: Signer | PublicKey,
    multiSigners: Signer[] = [],
    confirmOptions?: ConfirmOptions,
    programId = TOKEN_PROGRAM_ID
): Promise<TransactionSignature> {
    const [authorityPublicKey, signers] = getSigners(authority, multiSigners);

    const transaction = new Transaction().add(
        createCloseAccountInstruction(account, destination, authorityPublicKey, multiSigners, programId)
    );

    return await sendAndConfirmTransaction(connection, transaction, [payer, ...signers], confirmOptions);
}

export function createCloseAccountInstruction(
    account: PublicKey,
    destination: PublicKey,
    authority: PublicKey,
    multiSigners: Signer[] = [],
    programId = TOKEN_PROGRAM_ID
): TransactionInstruction {
    const keys = addSigners(
        [
            { pubkey: account, isSigner: false, isWritable: true },
            { pubkey: destination, isSigner: false, isWritable: true },
        ],
        authority,
        multiSigners
    );

    const data = Buffer.alloc(closeAccountInstructionData.span);
    closeAccountInstructionData.encode({ instruction: TokenInstruction.CloseAccount }, data);

    return new TransactionInstruction({ keys, programId, data });
}

export const closeAccountInstructionData = struct<CloseAccountInstructionData>([u8('instruction')]);

export interface CloseAccountInstructionData {
    instruction: TokenInstruction.CloseAccount;
}