'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('users', {
        id:         { type: Sequelize.STRING(16), primaryKey: true, allowNull: false },
        email:      { type: Sequelize.STRING,     allowNull: false, unique: true },
        password:   { type: Sequelize.STRING,     allowNull: false },
        name:       { type: Sequelize.STRING,     allowNull: false },
        role:       { type: Sequelize.STRING,     defaultValue: 'editor' },
        avatar:     { type: Sequelize.STRING },
        created_at: { type: Sequelize.DATE,       allowNull: false },
      }, { transaction: t });

      await queryInterface.addIndex('users', ['email'], { name: 'idx_users_email', unique: true, transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
