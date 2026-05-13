'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('ad_placements', {
        id:            { type: Sequelize.STRING(16), primaryKey: true, allowNull: false },
        name:          { type: Sequelize.STRING,     allowNull: false },
        description:   { type: Sequelize.TEXT },
        size:          { type: Sequelize.STRING },
        width:         { type: Sequelize.INTEGER },
        height:        { type: Sequelize.INTEGER },
        price_monthly: { type: Sequelize.INTEGER,    defaultValue: 0 },
        max_ads:       { type: Sequelize.INTEGER,    defaultValue: 1 },
        page_location: { type: Sequelize.STRING },
        position_key:  { type: Sequelize.STRING,     allowNull: false, unique: true },
        is_active:     { type: Sequelize.BOOLEAN,    defaultValue: true },
        created_at:    { type: Sequelize.DATE,       allowNull: false },
      }, { transaction: t });

      await queryInterface.addIndex('ad_placements', ['position_key'], { name: 'idx_ad_placements_position_key', unique: true, transaction: t });
      await queryInterface.addIndex('ad_placements', ['is_active'],    { name: 'idx_ad_placements_is_active',                  transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ad_placements');
  },
};
