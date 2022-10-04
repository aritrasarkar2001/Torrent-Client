'use strict';

const tp = require('./torrent-parser');

// module.exports = class {
//     constructor(size) {
//         this.requested = new Array(size).fill(false);
//         this.received = new Array(size).fill(false);
//     }

//     addRequested(pieceIndex) {
//         this.requested[pieceIndex] = true;
//     }

//     addReceived(pieceIndex) {
//         this.received[pieceIndex] = true;
//     }

//     needed(pieceIndex) {
//         if (this.requested.every(i => i === true)) {
//             this.requested = this.reeived.slice();
//         }
//         return !this.requested[pieceIndex];
//     }

//     isDone() {
//         return this.recieved.every(i => i === true);
//     }
// };

module.exports = class {
    constructor(torrent) {
        function buildPiecesArray() {
            const nPieces = torrent.info.pieces.length/20;
            const arr = new Array(nPieces).fill(null);
            return arr.map((_, i) => new Array(tp.blocksPerPiece(torrent, i)).fill(false));
        }

        this._requested = buildPiecesArray();
        this._received = buildPiecesArray();
    }

    addRequested(pieceBlock) {
        const blockIndex = pieceBlock.begin/tp.BLOCK_LEN;
        this._requested[pieceBlock.index][blockIndex] = true;
    }

    addReceived(pieceBlock) {
        const blockIndex = pieceBlock.begin/tp.BLOCK_LEN;
        this._received[pieceBlock.index][blockIndex] = true;
    }

    needed(pieceBlock) {
        if (this._requested.every(blocks => blocks.every(i => i))) {
            this._requested = this._received.map(blocks => blocks.slice());
        }
        const blockIndex = pieceBlock.begin / tp.BLOCK_LEN;
        return !this._requested[pieceBlock.index][blockIndex];
    }

    isDone() {
        return this._received.every(blocks => blocks.every(i => i));
    }
};