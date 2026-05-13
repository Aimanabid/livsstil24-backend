'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ads', 'ad_type',   { type: Sequelize.STRING, defaultValue: 'banner', after: 'alt_text' });
    await queryInterface.addColumn('ads', 'video_url', { type: Sequelize.STRING, after: 'ad_type' });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('ads', 'ad_type');
    await queryInterface.removeColumn('ads', 'video_url');
  },
};
