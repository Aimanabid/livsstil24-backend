'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ads', 'freq_cap_window', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: '24h',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('ads', 'freq_cap_window');
  },
};
