'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('team_informations', {
      team_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      team_name: {
        type: Sequelize.STRING(64),
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "team_name is mandatory field."
          },
          len: {
            args: [4, 64],
            msg: "team_name should have 4 to 10 characters."
          }
        }
      },
      team_logo: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'www.anylogourl.com',
        validate: {
          isUrl: {
            args: true,
            msg: "team_logo is not in valid url."
          }
        }
      },
      team_description: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'NA'
      },
      team_admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      is_default_team: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      }
      // ,
      // is_team_locked: {
      //   type: Sequelize.BOOLEAN,
      //   allowNull: false,
      //   defaultValue: false,
      // },
      //  updated_at: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      //   defaultValue: Sequelize.NOW
      // },
      // created_at: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      //   defaultValue: Sequelize.NOW
      // }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('team_informations');
  }
};