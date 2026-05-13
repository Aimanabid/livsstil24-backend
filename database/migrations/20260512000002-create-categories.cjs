'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('categories', {
        id:         { type: Sequelize.STRING(16), primaryKey: true, allowNull: false },
        name:       { type: Sequelize.STRING,     allowNull: false },
        slug:       { type: Sequelize.STRING,     allowNull: false, unique: true },
        color:      { type: Sequelize.STRING,     defaultValue: '#C9A96E' },
        icon:       { type: Sequelize.STRING },
        sort_order: { type: Sequelize.INTEGER,    defaultValue: 0 },
        created_at: { type: Sequelize.DATE,       allowNull: false },
      }, { transaction: t });

      await queryInterface.addIndex('categories', ['slug'],       { name: 'idx_categories_slug',       unique: true, transaction: t });
      await queryInterface.addIndex('categories', ['sort_order'], { name: 'idx_categories_sort_order',               transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('categories');
  },
};
