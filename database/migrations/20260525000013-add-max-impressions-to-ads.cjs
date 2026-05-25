'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ads', 'max_impressions', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('ads', 'max_impressions');
  },
};
