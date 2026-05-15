const { framingDecode, framingEncode } = require('risang-helper');
const arg = process.argv.slice(2);

const net = require('net');

const PIPE_NAME = '\\\\.\\pipe\\risang_jobs';

const client = net.createConnection(PIPE_NAME);

client.on('connect', () => {
    console.log('connect');

    const dt = {
        tipe: 'register',
        appid: '02'
    }

    const a = framingEncode([dt, 'halo']);
 
    console.log(a.toString());

    client.write(a);
})

client.on('data', (data) =>{
    const dec = new framingDecode();

    const msg = dec.push(data);

    for (let e of msg) {
        const m = String(e);

        console.log(m);
    }
})