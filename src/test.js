'use strict'

const fs = require('fs');
const Buffer = require('buffer').Buffer;
const bencode = require('bencode');
const bn = require('bn.js');
const urlParse = require('url').parse;

// var n = new bn(121);

// var k = n.toBuffer('be', 10);

// let buf = Buffer.alloc(10);
// buf.writeUInt32BE(65535, 0);
// buf.writeUInt32BE(65535, 4);
// console.log(buf.readBigUInt64BE(0));

let torrent = bencode.decode(fs.readFileSync('inscryption.torrent'));
console.log(torrent.announce.toString('utf8'));

// for(let i=0;i<torrent['announce-list'].length;i++){
//     console.log(torrent['announce-list'][i].toString());
// }

// let buf = Buffer.alloc(5);
// console.log(buf);

// const buff = Buffer.from([0x00, 0x00,
//     0x0e, 0x00, 0xff, 0xff, 0xff, 0xff]);
 
// // Getting big integer value by
// // using readBigUInt64BE method
// const value = buff.readBigUInt64BE(0);
// const numb = Number(value);
// console.log(numb);
 
// // Display the result
// console.log("Big Integer :- " + value);