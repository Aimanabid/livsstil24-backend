'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('customers', {
        id:           { type: Sequelize.STRING(16), primaryKey: true, allowNull: false },
        company:      { type: Sequelize.STRING,     allowNull: false },
        contact_name: { type: Sequelize.STRING },
        email:        { type: Sequelize.STRING,     allowNull: false, unique: true },
        phone:        { type: Sequelize.STRING },
        org_number:   { type: Sequelize.STRING },
        address:      { type: Sequelize.STRING },
        website:      { type: Sequelize.STRING },
        notes:        { type: Sequelize.TEXT },
        status:       { type: Sequelize.STRING,     defaultValue: 'active' },
        created_at:   { type: Sequelize.DATE,       allowNull: false },
      }, { transaction: t });

      await queryInterface.addIndex('customers', ['email'],  { name: 'idx_customers_email',  unique: true, transaction: t });
      await queryInterface.addIndex('customers', ['status'], { name: 'idx_customers_status',               transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('customers');
  },
};
