import axios from 'axios';

export const getTokenAccountBalance = async (tokenAccount: string, nodeEndpoint: string) => {
    const res = await axios.post(nodeEndpoint,
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTokenAccountBalance",
            "params": [
                tokenAccount,
                {
                    "encoding": "jsonParsed",
                    "commitment": "finalized"
                }
            ]
        });
    
    return res?.data?.result?.value?.amount;
}
