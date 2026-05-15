
const knex = require('knex');
const conf = require('../knexfile');
const { CronExpressionParser } = require('cron-parser');
const { framingDecode, framingEncode, createId } = require('risang-helper');


const local = knex(conf.local);
const db = knex(conf.development);
const client = new Map();


module.exports.local = local;

module.exports.init = async ()=>{

    try {
        await local.schema.createTable('jobs', (t) => {
       
            t.integer('noini').primary();
            t.string('cron');

            t.datetime('next');
            t.boolean('finish');
            t.boolean('aktif');

            t.timestamps(true, true);
        });

    } catch (error) {
        console.log('err jobs', error.message)
    }
    
    await local.schema.createTable('action', (t) => {

        t.increments('noini').primary();

        t.integer('nojob').notNullable();

        t.string('tipe');
        t.string('to');
        t.string('param');

        t.boolean('aktif');

        t.timestamps(true, true);

    });

    await local.schema.createTable('client', (t) => {
       
        t.string('clientid').primary();
        t.string('appid');
        
        t.index(['appid']);
    });

    return true;
}

module.exports.parse = ( str, options ) =>{


    try {

        const interval = CronExpressionParser.parse(str, options);

        return new Date(interval.next().toString());

    } catch (error) {
        
    }

}

module.exports.action = async (no) =>{
    
    const action = local('action').select('tipe', 'to', 'param')
                            .where('nojob', no)
                            .as('a');

    const ls = await local(action)
                    .leftJoin('client as b', 'a.to', 'b.appid')
                    .select('a.*', 'b.clientid');

    console.log(ls);

    ls.forEach(d => {
        
        if( d.tipe == 'socket'){

            if( client.has(d.clientid) ){
                client.get(d.clientid).write(framingEncode([d.param]));
            }

        }

        if( d.tipe == 'webhook' ){

            const h = JSON.parse(d.param)

            fetch(d.to, {
                method: h?.method || 'GET',
                headers: h?.header || {},
                body: h?.body || {},
            })
        }

    });

}

module.exports.update = async (smt, param, no) => {

    try {
        await db('jobs').update({
            next: db.raw(`CASE ${smt} ELSE next END`, param)
        }).whereIn('noini', no)

    } catch (error) {
        console.log('err', error.message)
    }
    
}

module.exports.addClient = async( socket, app ) => {

    const id = socket.id;

    client.set(socket.id, socket);
        
    await local('client').insert([{
        clientid: socket.id,
        appid: app
    }]);
    
}

module.exports.removeClient = async (id) =>{
    client.delete(id);

    await local('client').where('clientid', id).del();
}

module.exports.load = async () =>{

    const job = await db('jobs');
    const ls = [];

    for( let dt of job ){
        // const nxt = nextWaktu(dt.kode, dt);
        ls.push({
            'noini' : dt.noini,
            'cron' : dt.cron,
            'next' : dt.next || new Date(),
            'aktif': dt.aktif
        })
    }

    const acti = await db('action');
    const act = [];
    
    for( let dt of acti ){
        act.push({
            'nojob' : dt.nojob,
            'tipe' : dt.tipe,
            'to' : dt.to,
            'param' : dt.param,
            'aktif' : dt.aktif,
        })
    }

    if( ls.length > 0 ){
        await local('jobs').insert(ls);
    }

    if( act.length > 0 ){
        await local('action').insert(act);

    }

    return;
}