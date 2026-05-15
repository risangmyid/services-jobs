const { framingDecode, framingEncode, createId } = require('risang-helper');

const knex = require('knex');
const conf = require('./knexfile');

const net = require('net');
const core = require('./libs/core');

// const local = knex(conf.local);
// const db = knex(conf.development);

const PIPE_NAME = '\\\\.\\pipe\\risang_jobs';
const client = new Map();

const server = net.createServer((socket) => {

    const id = createId();

    console.log('connect', id);
    socket.id = id;

    socket.on('data', async (data) =>{
        const dec = new framingDecode();

        const msg = dec.push(data);

        for (let e of msg) {
            const m = String(e);

            try {
                const obj = JSON.parse(m);

                if( obj?.tipe == 'register' && obj?.appid ){
                    core.addClient(socket, obj?.appid);
                }

                
            } catch (error) {
                console.log(m);
            }

        }
    })

    socket.on('end', () => {
        console.log('disconnet');

        core.removeClient(id)
    })

});

let akhir;


const delay = (ms) =>{
    return new Promise(r => setTimeout(r, ms));
}

const action = async (no) => {

    // const act = await local('action').where({ 'nojob' : no, 'aktif' : 1 })

    // for( let c of act ){

    // }

}


core.init().then( async ()=>{

    await core.load();

    server.listen(PIPE_NAME, ()=> {
        console.log('Unix Jalan ', PIPE_NAME);
    })


    setInterval( async () => {
        
        const tgl = new Date();

        if( akhir ){
            const block = tgl - akhir;

            if( block > 1100 ){
                console.log('Terblock', block);
            }

        }

        const gt = await core.local('jobs').where('next', '<=', tgl);

        // console.log('a', gt);
        
        let upd = [];
        let bnd = [];
        let no = [];
        let k = 0;

        gt.forEach( async (s) => {
            k++;

            const nxt = core.parse(s.cron, 
                 {
                    currentDate: s.next || tgl,
                    // endDate: '2024-01-01T00:00:00Z',
                    tz: 'Asia/Jakarta',
                }
            )

            await core.local('jobs').where({ 'noini' : s.noini }).update('next', nxt);

            console.log('upd', tgl, nxt);
            core.action(s.noini);
            
            upd.push(`WHEN noini=? THEN ?`);
            bnd.push(s.noini, nxt);
            no.push(s.noini);

            console.log('a', no);

            if( no.length > 0  && k == gt.length){
                console.log('mysql')
                core.update(upd, bnd, no);
            }

        }); 

        
    }, 1000);
})
