'use strict'

const fs = require('fs');
const bencode = require('bencode');
const crypto = require('crypto');
const bn = require('bn.js');
const Buffer = require('buffer').Buffer;

module.exports.open = (filepath) => {
    let torrent = bencode.decode(fs.readFileSync(filepath));
    console.log(torrent.announce.toString('utf8'))
    return torrent;//readFileSync - easiest way to read a file, but instead of returning a string it returns a buffer, so we have to convert into a string
    //console.log(torrent.announce.toString('utf8'));
}

module.exports.infoHash = (torrent) => {
    //console.log(crypto.createHash('SHA1').update(bencode.encode(torrent.info)).digest());
    return crypto.createHash('SHA1').update(bencode.encode(torrent.info)).digest(); // digest without any arg will return a buffer
};

module.exports.size = (torrent) => {
    let len = torrent.info.files ? torrent.info.files.map(file => file.length).reduce((a, b) => (a+b)) : torrent.info.length ;
    let bigNum = new bn(len);
    //console.log(len);
    //console.log(bigNum.toBuffer('be', 8).readUInt32BE(4));
    return bigNum.toBuffer('be', 8);
};

module.exports.BLOCK_LEN = Math.pow(2, 14);

module.exports.pieceLen = (torrent, pieceIndex) => {
    const totalLengthBI = this.size(torrent).readBigUInt64BE(0);
    const totalLength = Number(totalLengthBI);
    const pieceLength = torrent.info['piece length'];

    const lastPieceLength = totalLength % pieceLength;
    const lastPieceIndex = Math.floor(totalLength / pieceLength);

    return lastPieceIndex === pieceIndex ? lastPieceLength : pieceLength;
};

module.exports.blocksPerPiece = (torrent, pieceIndex) => {
    const pieceLength = this.pieceLen(torrent, pieceIndex);
    return Math.ceil(pieceLength/this.BLOCK_LEN);
}

module.exports.blockLen = (torrent, pieceIndex, blockIndex) => {
    const pieceLength = this.pieceLen(torrent, pieceIndex);
    const lastBlockLength = pieceLength % this.BLOCK_LEN;
    const lastBlockIndex = Math.floor(pieceLength / this.BLOCK_LEN);

    return blockIndex === lastBlockIndex ? lastBlockLength : this.BLOCK_LEN;
}