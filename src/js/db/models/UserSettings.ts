import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import SequelizeInstance from '@/js/db';

class UserSettingsModel extends Model<InferAttributes<UserSettingsModel>, InferCreationAttributes<UserSettingsModel>> {
  declare userId: string;

  declare locale: string;

  static async setLocale(userId: string, locale: string) {
    await UserSettingsModel.findOrCreate({
      where: { userId },
      defaults: { userId, locale },
    });
  }
}

UserSettingsModel.init({
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  locale: {
    type: DataTypes.ENUM('fr-FR', 'en-EN'),
  },
}, {
  sequelize: SequelizeInstance,
  modelName: 'userSettings',
});

export { UserSettingsModel };
