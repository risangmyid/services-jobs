/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {

    // await knex.schema.createTable('tipe', (t) => {
    //     t.string('kode').primary();
    //     t.string('tipe');
    //     t.string('nama');
        
    //     t.timestamp('create_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    //     t.timestamp('update_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    // });
  
    await knex.schema.createTable('jobs', (t) => {
        
        t.increments('noini').primary();

        t.string('cron');
        
        t.datetime('next');
        t.boolean('aktif');

        t.timestamp('create_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        t.timestamp('update_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

    });

    await knex.schema.createTable('action', (t) => {

        t.increments('noini').primary();

        t.integer('nojob').notNullable();

        t.string('tipe');
        t.string('to');
        t.string('param');

        t.boolean('aktif');

        t.timestamp('create_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        t.timestamp('update_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
//   await knex.schema.dropTable('tipe');
  await knex.schema.dropTable('jobs');
  await knex.schema.dropTable('action');
};
