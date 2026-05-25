'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ads', 'freq_cap', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('ad_events', 'ip_address', {
      type: Sequelize.STRING(45),
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addIndex('ad_events', ['ip_address', 'ad_id', 'event_type'], {
      name: 'ad_events_ip_ad_type',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeIndex('ad_events', 'ad_events_ip_ad_type');
    await queryInterface.removeColumn('ad_events', 'ip_address');
    await queryInterface.removeColumn('ads', 'freq_cap');
  },
};
