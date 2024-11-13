import { DataTypes } from 'sequelize';
import { SequelizeService } from '../services/SequelizeService';

export const Topic = SequelizeService.define('Topic', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    authorId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
});
