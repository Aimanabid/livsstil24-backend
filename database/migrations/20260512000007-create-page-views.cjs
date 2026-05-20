'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('page_views', {
        id:         { type: Sequelize.INTEGER,    autoIncrement: true, primaryKey: true },
        article_id: { type: Sequelize.STRING(16) },
        page:       { type: Sequelize.STRING },
        referrer:   { type: Sequelize.STRING },
        country:    { type: Sequelize.STRING },
        device:     { type: Sequelize.STRING },
        visitor_id: { type: Sequelize.STRING(36) },
        created_at: { type: Sequelize.DATE, allowNull: false },
      }, { transaction: t });

      await queryInterface.addIndex('page_views', ['article_id'],  { name: 'idx_page_views_article_id',  transaction: t });
      await queryInterface.addIndex('page_views', ['created_at'],  { name: 'idx_page_views_created_at',  transaction: t });
      await queryInterface.addIndex('page_views', ['visitor_id'],  { name: 'idx_page_views_visitor_id',  transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('page_views');
  },
};
