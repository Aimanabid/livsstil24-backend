'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('page_views', 'session_id', {
      type: Sequelize.STRING(36),
      allowNull: true,
      defaultValue: null,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('page_views', 'session_id');
  },
};
