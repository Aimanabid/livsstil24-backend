'use strict';

module.exports = {
  async up(queryInterface) {
    // Migrate old ad_type values to new two-value system
    await queryInterface.sequelize.query(
      `UPDATE ads SET ad_type = 'image' WHERE ad_type IN ('banner', 'box')`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE ads MODIFY COLUMN ad_type VARCHAR(255) NOT NULL DEFAULT 'image'`
    );
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TABLE ads MODIFY COLUMN ad_type VARCHAR(255) NOT NULL DEFAULT 'banner'`
    );
  },
};
