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
};

const validationSchema = object({
  id: string(),
  enabled: boolean()
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

  const { id, enabled } = body as ExtensionRequest;

  try {
    const redis = createRedisClient();

    if (enabled) {
      await prisma.verified.create({ data: { id } });
      // Delete the cache
      await redis.del('verified');
      logger.info(`Enabled verified for ${id}`);

      return res.status(200).json({ success: true, enabled });
    }

    await prisma.verified.delete({ where: { id } });
    // Delete the cache
    await redis.del('verified');
    logger.info(`Disabled verified for ${id}`);

    return res.status(200).json({ success: true, enabled });
  } catch (error) {
    return catchedError(res, error);
  }
};
