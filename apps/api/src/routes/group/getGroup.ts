import { Errors } from '@hey/data/errors';
import logger from '@hey/lib/logger';
import catchedError from '@utils/catchedError';
import {
  REDIS_EX_8_HOURS,
  SWR_CACHE_AGE_10_MINS_30_DAYS
} from '@utils/constants';
import createRedisClient from '@utils/createRedisClient';
import prisma from '@utils/prisma';
import type { Handler } from 'express';

export const get: Handler = async (req, res) => {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ success: false, error: Errors.NoBody });
  }

  try {
    const redis = createRedisClient();
    const cache = await redis.get(`group:${slug}`);

    if (cache) {
      logger.info('Group fetched from cache');
      return res
        .status(200)
        .setHeader('Cache-Control', SWR_CACHE_AGE_10_MINS_30_DAYS)
        .json({ success: true, cached: true, result: JSON.parse(cache) });
    }

    const data = await prisma.group.findUnique({
      where: { slug: slug as string }
    });
    await redis.set(
      `group:${slug}`,
      JSON.stringify(data),
      'EX',
      REDIS_EX_8_HOURS
    );
    logger.info('Group fetched from DB');

    return res
      .status(200)
      .setHeader('Cache-Control', SWR_CACHE_AGE_10_MINS_30_DAYS)
      .json({ success: true, result: data });
  } catch (error) {
    return catchedError(res, error);
  }
};
