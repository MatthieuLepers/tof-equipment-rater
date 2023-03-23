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

  static async getLocale(userId: string): Promise<string | undefined> {
    const settings = await UserSettingsModel.findOne({
      where: { userId },
    });

    return settings?.locale;
  }

  static async setLocale(userId: string, locale: string) {
    const [userLocale, created] = await UserSettingsModel.findOrCreate({
      where: { userId },
      defaults: { userId, locale },
    });
    if (!created && userLocale.locale !== locale) {
      userLocale.locale = locale;
      await userLocale.save();
    }
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
