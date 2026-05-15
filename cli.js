#!/usr/bin/env node

const { framingDecode, framingEncode } = require('risang-helper');
const arg = process.argv.slice(2);

console.log('a', process.argv);

const net = require('net');

const PIPE_NAME = '\\\\.\\pipe\\risang_jobs';

const client = net.createConnection(PIPE_NAME);

client.on('connect', () => {

    const a = framingEncode([dt, 'halo']);
 
    console.log(a.toString());

    client.write(a);
})

