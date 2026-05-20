'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('ad_events', {
        id:         { type: Sequelize.INTEGER,    autoIncrement: true, primaryKey: true },
        ad_id:      { type: Sequelize.STRING(16) },
        event_type: { type: Sequelize.STRING },
        created_at: { type: Sequelize.DATE, allowNull: false },
      }, { transaction: t });

      await queryInterface.addIndex('ad_events', ['ad_id'],      { name: 'idx_ad_events_ad_id',      transaction: t });
      await queryInterface.addIndex('ad_events', ['created_at'], { name: 'idx_ad_events_created_at',  transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ad_events');
  },
};
