'use strict';

module.exports = {
  async up(queryInterface) {
    // DROP first in case a previous partial run left one behind (MySQL DDL is not transactional)
    const drop = async (table, name) => {
      try { await queryInterface.removeIndex(table, name); } catch {}
    };
    await drop('page_views', 'page_views_article_created');
    await drop('ad_events',  'ad_events_ad_created');

    await queryInterface.addIndex('page_views', ['article_id', 'created_at'], {
      name: 'page_views_article_created',
    });
    await queryInterface.addIndex('ad_events', ['ad_id', 'created_at'], {
      name: 'ad_events_ad_created',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('page_views', 'page_views_article_created');
    await queryInterface.removeIndex('ad_events',  'ad_events_ad_created');
  },
};
