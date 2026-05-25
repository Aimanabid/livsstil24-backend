'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('page_views', 'ip_address', {
      type: Sequelize.STRING(45),
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addIndex('page_views', ['ip_address'], {
      name: 'page_views_ip_address',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeIndex('page_views', 'page_views_ip_address');
    await queryInterface.removeColumn('page_views', 'ip_address');
  },
};
