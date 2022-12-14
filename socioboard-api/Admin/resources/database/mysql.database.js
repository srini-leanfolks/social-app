import db from '../../../Common/Sequelize-cli/models/index.js';

class DbConnect {
  async initialize() {
    try {
      const connection = await db.sequelize.sync({
        force: process.env.NODE_ENV === 'test',
        logging: false,
      });

      if (connection){
        console.log('Mysql database connected');
        return connection;
      }
    } catch (err) {
      console.log(`My sql connection error :${err.message}`);
      throw err;
    }
  }
}

export default DbConnect;
