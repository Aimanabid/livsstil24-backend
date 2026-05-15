'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.createTable('site_settings', {
        key:   { type: Sequelize.STRING(100), primaryKey: true, allowNull: false },
        value: { type: Sequelize.TEXT, allowNull: true },
      }, { transaction: t });

      await queryInterface.bulkInsert('site_settings', [
        { key: 'site_description', value: 'Din digitala livsstilstidning för mode, skönhet och det moderna livet.' },
        { key: 'instagram_url',    value: '' },
        { key: 'facebook_url',     value: '' },
        { key: 'tiktok_url',       value: '' },
      ], { transaction: t });
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('site_settings');
  },
};
