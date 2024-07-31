const web3 = require("@solana/web3.js");
 
let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
 
let slot = await connection.getSlot();
console.log(slot);
// 93186439
 
let blockTime = await connection.getBlockTime(slot);
console.log(blockTime);
// 1630747045
 
let block = await connection.getBlock(slot);
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
 
let slotLeader = await connection.getSlotLeader();
console.log(slotLeader);
//49AqLYbpJYc2DrzGUAH1fhWJy62yxBxpLEkfJwjKy2jr