import { Errors } from '@hey/data/errors';
import logger from '@hey/lib/logger';
import catchedError from '@utils/catchedError';
import createRedisClient from '@utils/createRedisClient';
import validateIsStaff from '@utils/middlewares/validateIsStaff';
import prisma from '@utils/prisma';
import type { Handler } from 'express';
import { boolean, object, string } from 'zod';

type ExtensionRequest = {
  id: string;
  enabled: boolean;
  trial: boolean;
};

const validationSchema = object({
  id: string(),
  enabled: boolean(),
  trial: boolean()
});

export const post: Handler = async (req, res) => {
  const { body } = req;

  if (!body) {
    return res.status(400).json({ success: false, error: Errors.NoBody });
  }

  const validation = validationSchema.safeParse(body);

  if (!validation.success) {
    return res.status(400).json({ success: false, error: Errors.InvalidBody });
  }

  if (!(await validateIsStaff(req))) {
    return res.status(400).json({ success: false, error: Errors.NotStaff });
  }

  const { id, enabled, trial } = body as ExtensionRequest;

  try {
    const redis = createRedisClient();

    if (enabled) {
      await prisma.pro.create({
        data: {
          profileId: id,
          hash: '0x00',
          expiresAt: '2100-01-01T00:00:00.000Z'
        }
      });
      // Delete the cache
      await redis.del(`preferences:${id}`);
      logger.info(`Enabled pro for ${id}`);

      return res.status(200).json({ success: true, enabled, trial });
    }

    await prisma.pro.delete({ where: { profileId: id } });
    // Delete the cache
    await redis.del(`preferences:${id}`);
    logger.info(`Disabled pro for ${id}`);

    return res.status(200).json({ success: true, enabled, trial });
  } catch (error) {
    return catchedError(res, error);
  }
};
