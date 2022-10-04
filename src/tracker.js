'use strict';

const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;
//for connection id
const crypto = require('crypto');
const util = require('./util');
const torrentParser = require('./torrent-parser')

module.exports.getPeers = (torrent, callback) => {

    const socket = dgram.createSocket('udp4');
    const url = torrent.announce.toString('utf8');

    // for the connection request
    udpSend(socket, buildConnReq(), url, () => {
        console.log("udp connect request sent!!");
    });

    socket.on('message', response => {

        console.log("message recieved !!");

        if(respType(response) == 'connect'){
            console.log("connect - response");
            //get the connection id
            const connResp = parseConnResp(response);

            //send an announce request
            const announceReq = buildAnnounceReq(connResp.connection_id, torrent); 
            udpSend(socket, announceReq, url, () => {
                console.log("udp announce request sent !!");
            });
        }else if(respType(response) == 'announce'){

            console.log("announce - response");
            //take the peer list from announce response
            const announceResp = announceRespParser(response);

            //send the peerlist back using the call back function
            //console.log(announceResp);
            callback(announceResp.peers)

        }
    })

}

function udpSend(socket, message, rawUrl, callback= () => {} ){
    const url = urlParse(rawUrl);
    //console.log(rawUrl, " ", url.host, " ", url.port);
    socket.send(message, 0, message.length, url.port, url.hostname, callback);
}

//udpSend checker
// let urlTest = {
//     host : "127.0.0.1",
//     port : "8081"
// }
// let message = Buffer.from("YO Bhai!!!");
// let socket = dgram.createSocket('udp4');
// let someFunc = () => {
//     console.log("callBack");
// }

// udpSend(socket, buildConnReq(), urlTest);

function buildConnReq(){
    //follow the udp connection request format
    //buffer is of size 16 bytes

    const buf = Buffer.alloc(16);

    //first part is the protocol number
    //writing numbers to buffer has function name depending on the type of numbers being used - unsigned 32 bit int (Big Endian - The normal order of bytes)
    buf.writeUInt32BE(0x417, 0);
    buf.writeUInt32BE(0x27101980, 4);
    //we wrote two 32 bit function calls because there is no 64 bit function.

    //action
    buf.writeUInt32BE(0, 8);

    //transaction id (random value)
    crypto.randomBytes(4).copy(buf, 12);
    //crypto.randomBytes() returns a buffer, so we can use its copy property

    return buf;
}

function parseConnResp(resp){
    //connection response format 
    return {
        action : resp.readUint32BE(0),
        transaction_id : resp.readUint32BE(4),
        connection_id : resp.slice(8)
    }
    // we left connection_id as buffer as it is difficult to read a 64 bits int 
}
 
function buildAnnounceReq(conn_id, torrent, port=6881){

    const buf = Buffer.allocUnsafe(98);

    //connection_id which is in buffer
    conn_id.copy(buf, 0);
    //action
    buf.writeUInt32BE(1, 8);// 1 - action
    //transaction_id
    crypto.randomBytes(4).copy(buf, 12);
    //info_hash
    torrentParser.infoHash(torrent).copy(buf, 16);
    //peer_id
    util.genId().copy(buf, 36);
    //downloaded
    Buffer.alloc(8).copy(buf, 56);
    //left
    torrentParser.size(torrent).copy(buf, 64);
    //uploaded
    Buffer.alloc(8).copy(buf, 72);
    //event
    buf.writeUint32BE(0, 80);
    //IP address
    buf.writeUint32BE(0, 84);
    //key
    crypto.randomBytes(4).copy(buf, 88);
    //num_want
    buf.writeInt32BE(-1, 92);
    //port
    buf.writeUint16BE(port, 96);

    return buf;
}

function announceRespParser(resp){
    //since the number of peers that are going to be returned is unknown we must divide the data according to the syntax
    function group(itter, groupSize){
        let groups = [];

        for(let i=0;i<itter.length;i = i + groupSize){
            groups.push(itter.slice(i,i+groupSize))
        }
        return groups;
    }
    
    //console.log(resp.length);
    return {
        action: resp.readUint32BE(0),
        transaction_id: resp.readUint32BE(4),
        intervals: resp.readUint32BE(8),
        leechers: resp.readUint32BE(12),
        seeders: resp.readUint32BE(16),
        peers : group(resp.slice(20), 6).map(add => {
            return {
                ip: add.slice(0,4).join('.'),
                port: add.readUint16BE(4)
            }
        })

    }
}


function respType(resp){
    let type = resp.readUint32BE(0);
    if(type === 0){
        return "connect";
    }else if(type === 1){
        return "announce";
    }
}