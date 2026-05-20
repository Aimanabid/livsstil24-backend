'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('ads', {
        id:           { type: Sequelize.STRING(16), primaryKey: true, allowNull: false },
        title:        { type: Sequelize.STRING,     allowNull: false },
        image_url:    { type: Sequelize.STRING },
        link_url:     { type: Sequelize.STRING },
        alt_text:     { type: Sequelize.STRING },
        ad_type:      { type: Sequelize.STRING,     defaultValue: 'image' },
        video_url:    { type: Sequelize.STRING },
        placement_id: { type: Sequelize.STRING(16), references: { model: 'ad_placements', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
        customer_id:  { type: Sequelize.STRING(16), references: { model: 'customers',     key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
        status:       { type: Sequelize.STRING,     defaultValue: 'active' },
        start_date:   { type: Sequelize.DATEONLY },
        end_date:     { type: Sequelize.DATEONLY },
        clicks:       { type: Sequelize.INTEGER,    defaultValue: 0 },
        impressions:  { type: Sequelize.INTEGER,    defaultValue: 0 },
        price_paid:   { type: Sequelize.INTEGER,    defaultValue: 0 },
        created_at:   { type: Sequelize.DATE,       allowNull: false },
      }, { transaction: t });

      await queryInterface.addIndex('ads', ['customer_id'],  { name: 'idx_ads_customer_id',  transaction: t });
      await queryInterface.addIndex('ads', ['status'],       { name: 'idx_ads_status',        transaction: t });
      // Composite index for getByPlacement: active ads for a slot within a date range
      await queryInterface.addIndex('ads', ['placement_id', 'status'], { name: 'idx_ads_placement_id_status', transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ads');
  },
};
