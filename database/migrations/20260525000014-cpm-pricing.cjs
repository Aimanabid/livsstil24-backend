'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ad_placements', 'cpm_rate', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.removeColumn('ad_placements', 'price_monthly');
    await queryInterface.removeColumn('ads', 'price_paid');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('ad_placements', 'price_monthly', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.removeColumn('ad_placements', 'cpm_rate');
    await queryInterface.addColumn('ads', 'price_paid', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },
};
