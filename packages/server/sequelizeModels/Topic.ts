import { DataTypes, Model } from 'sequelize';
import { SequelizeService } from '../services/SequelizeService';

export class Topic extends Model {}
Topic.init(
    {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        authorName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    { sequelize: SequelizeService },
);
