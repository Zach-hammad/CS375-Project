async function main() {
    let connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"), "confirmed");

    // Fetch the current slot
    let slot = await connection.getSlot();
    console.log(slot);
    // 93186439

    // Fetch the block time for the current slot
    let blockTime = await connection.getBlockTime(slot);
    console.log(blockTime);
    // 1630747045

    // Fetch the block information with the maxSupportedTransactionVersion parameter
    let block = await connection.getBlock(slot, { maxSupportedTransactionVersion: 0 });
    console.log(block);

    /*
    {
        blockHeight: null,
        blockTime: 1630747045,
        blockhash: 'AsFv1aV5DGip9YJHHqVjrGg6EKk55xuyxn2HeiN9xQyn',
        parentSlot: 93186438,
        previousBlockhash: '11111111111111111111111111111111',
        rewards: [],
        transactions: []
    }
    */

    // Fetch the slot leader
    let slotLeader = await connection.getSlotLeader();
    console.log(slotLeader);
    //49AqLYbpJYc2DrzGUAH1fhWJy62yxBxpLEkfJwjKy2jr

    // Fetch account information
    const address = new solanaWeb3.PublicKey("C33qt1dZGZSsqTrHdtLKXPZNoxs6U1ZBfyDkzmj6mXeR");
    const accountInfo = await connection.getAccountInfo(address);

    console.log(JSON.stringify(accountInfo, null, 2));
}

main();
