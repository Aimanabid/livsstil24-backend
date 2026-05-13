'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('articles', {
        id:              { type: Sequelize.STRING(16), primaryKey: true, allowNull: false },
        title:           { type: Sequelize.STRING,     allowNull: false },
        slug:            { type: Sequelize.STRING,     allowNull: false, unique: true },
        excerpt:         { type: Sequelize.TEXT },
        content:         { type: Sequelize.TEXT('long') },
        featured_image:  { type: Sequelize.STRING },
        category_id:     { type: Sequelize.STRING(16), references: { model: 'categories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
        author_id:       { type: Sequelize.STRING(16), references: { model: 'users',      key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
        status:          { type: Sequelize.STRING,     defaultValue: 'draft' },
        featured:        { type: Sequelize.BOOLEAN,    defaultValue: false },
        views:           { type: Sequelize.INTEGER,    defaultValue: 0 },
        read_time:       { type: Sequelize.INTEGER,    defaultValue: 5 },
        tags:            { type: Sequelize.JSON,       defaultValue: [] },
        seo_title:       { type: Sequelize.STRING },
        seo_description: { type: Sequelize.TEXT },
        published_at:    { type: Sequelize.DATE },
        created_at:      { type: Sequelize.DATE,       allowNull: false },
        updated_at:      { type: Sequelize.DATE,       allowNull: false },
      }, { transaction: t });

      await queryInterface.addIndex('articles', ['slug'],        { name: 'idx_articles_slug',                  unique: true, transaction: t });
      await queryInterface.addIndex('articles', ['category_id'], { name: 'idx_articles_category_id',                        transaction: t });
      await queryInterface.addIndex('articles', ['author_id'],   { name: 'idx_articles_author_id',                          transaction: t });
      await queryInterface.addIndex('articles', ['status'],      { name: 'idx_articles_status',                             transaction: t });
      // Composite index for the most common public query: published articles sorted by date
      await queryInterface.addIndex('articles', ['status', 'published_at'], { name: 'idx_articles_status_published_at', transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('articles');
  },
};
