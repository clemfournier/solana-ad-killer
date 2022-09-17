import { Connection, PublicKey, Commitment, AccountInfo, Account, ConfirmOptions, Signer } from "@solana/web3.js";
import { TokenAccountNotFoundError, TokenInvalidAccountOwnerError, TokenInvalidAccountSizeError, TokenInvalidAccountError, TokenOwnerOffCurveError } from "../constants/errors";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "../constants/solana-constants";
import { struct, u32, u8 } from '@solana/buffer-layout';
import { publicKey, u64, bool } from '@solana/buffer-layout-utils';

export async function getAssociatedTokenAddress(
    mint: PublicKey,
    owner: PublicKey,
    allowOwnerOffCurve = false,
    programId = TOKEN_PROGRAM_ID,
    associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
): Promise<PublicKey> {
    if (!allowOwnerOffCurve && !PublicKey.isOnCurve(owner.toBuffer())) throw new TokenOwnerOffCurveError();

    const [address] = await PublicKey.findProgramAddress(
        [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
        associatedTokenProgramId
    );

    return address;
}

export async function getAccount(
    connection: Connection,
    address: PublicKey,
    commitment?: Commitment,
    programId = TOKEN_PROGRAM_ID
): Promise<Account> {
    const info = await connection.getAccountInfo(address, commitment);
    return unpackAccount(info, address, programId);
}

function unpackAccount(info: AccountInfo<Buffer> | null, address: PublicKey, programId: PublicKey) {
    if (!info) throw new TokenAccountNotFoundError();
    if (!info.owner.equals(programId)) throw new TokenInvalidAccountOwnerError();
    if (info.data.length < ACCOUNT_SIZE) throw new TokenInvalidAccountSizeError();

    const rawAccount = AccountLayout.decode(info.data.slice(0, ACCOUNT_SIZE));
    let tlvData = Buffer.alloc(0);
    if (info.data.length > ACCOUNT_SIZE) {
        if (info.data.length === MULTISIG_SIZE) throw new TokenInvalidAccountSizeError();
        if (info.data[ACCOUNT_SIZE] != AccountType.Account) throw new TokenInvalidAccountError();
        tlvData = info.data.slice(ACCOUNT_SIZE + ACCOUNT_TYPE_SIZE);
    }

    // TODO: Last 3 arguments I've added manually, should look into that.
    return {
        address,
        mint: rawAccount.mint,
        owner: rawAccount.owner,
        amount: rawAccount.amount,
        delegate: rawAccount.delegateOption ? rawAccount.delegate : null,
        delegatedAmount: rawAccount.delegatedAmount,
        isInitialized: rawAccount.state !== AccountState.Uninitialized,
        isFrozen: rawAccount.state === AccountState.Frozen,
        isNative: !!rawAccount.isNativeOption,
        rentExemptReserve: rawAccount.isNativeOption ? rawAccount.isNative : null,
        closeAuthority: rawAccount.closeAuthorityOption ? rawAccount.closeAuthority : null,
        tlvData,
        keypair: null,
        publicKey: new PublicKey(''),
        secretKey: new Buffer('')
    };
}

export const AccountLayout = struct<RawAccount>([
    publicKey('mint'),
    publicKey('owner'),
    u64('amount'),
    u32('delegateOption'),
    publicKey('delegate'),
    u8('state'),
    u32('isNativeOption'),
    u64('isNative'),
    u64('delegatedAmount'),
    u32('closeAuthorityOption'),
    publicKey('closeAuthority'),
]);

export const MultisigLayout = struct<RawMultisig>([
    u8('m'),
    u8('n'),
    bool('isInitialized'),
    publicKey('signer1'),
    publicKey('signer2'),
    publicKey('signer3'),
    publicKey('signer4'),
    publicKey('signer5'),
    publicKey('signer6'),
    publicKey('signer7'),
    publicKey('signer8'),
    publicKey('signer9'),
    publicKey('signer10'),
    publicKey('signer11'),
]);

export interface RawAccount {
    mint: PublicKey;
    owner: PublicKey;
    amount: bigint;
    delegateOption: 1 | 0;
    delegate: PublicKey;
    state: AccountState;
    isNativeOption: 1 | 0;
    isNative: bigint;
    delegatedAmount: bigint;
    closeAuthorityOption: 1 | 0;
    closeAuthority: PublicKey;
}

export enum AccountState {
    Uninitialized = 0,
    Initialized = 1,
    Frozen = 2,
}

export const ACCOUNT_SIZE = AccountLayout.span;
export const MULTISIG_SIZE = MultisigLayout.span;

export type RawMultisig = Omit<Multisig, 'address'>;

export interface Multisig {
    /** Address of the multisig */
    address: PublicKey;
    /** Number of signers required */
    m: number;
    /** Number of possible signers, corresponds to the number of `signers` that are valid */
    n: number;
    /** Is this mint initialized */
    isInitialized: boolean;
    /** Full set of signers, of which `n` are valid */
    signer1: PublicKey;
    signer2: PublicKey;
    signer3: PublicKey;
    signer4: PublicKey;
    signer5: PublicKey;
    signer6: PublicKey;
    signer7: PublicKey;
    signer8: PublicKey;
    signer9: PublicKey;
    signer10: PublicKey;
    signer11: PublicKey;
}

export enum AccountType {
    Uninitialized,
    Mint,
    Account,
}
export const ACCOUNT_TYPE_SIZE = 1;