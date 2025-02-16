import { Errors } from '@hey/data/errors';
import logger from '@hey/lib/logger';
import parseJwt from '@hey/lib/parseJwt';
import catchedError from '@utils/catchedError';
import { REDIS_EX_8_HOURS } from '@utils/constants';
import createRedisClient from '@utils/createRedisClient';
import prisma from '@utils/prisma';
import type { Handler } from 'express';

export const get: Handler = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: Errors.NoBody });
  }

  const accessToken = req.headers['x-access-token'] as string;

  try {
    const payload = parseJwt(accessToken);
    const redis = createRedisClient();
    const cache = await redis.get(`poll:${id}`);

    if (cache) {
      logger.info('Poll fetched from cache');
      return res
        .status(200)
        .json({ success: true, cached: true, result: JSON.parse(cache) });
    }

    const data = await prisma.poll.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        endsAt: true,
        options: {
          select: {
            id: true,
            option: true,
            _count: { select: { responses: true } },
            responses: {
              where: { profileId: payload.id },
              select: { id: true }
            }
          }
        }
      }
    });

    if (!data) {
      return res.status(400).json({ success: false, error: 'Poll not found.' });
    }

    const totalResponses = data.options.reduce(
      (acc, option) => acc + option._count.responses,
      0
    );

    const sanitizedData = {
      id: data.id,
      endsAt: data.endsAt,
      options: data.options.map((option) => ({
        id: option.id,
        option: option.option,
        voted: option.responses.length > 0,
        percentage:
          totalResponses > 0
            ? (option._count.responses / totalResponses) * 100
            : 0,
        responses: option._count.responses
      }))
    };

    await redis.set(
      `poll:${id}`,
      JSON.stringify(sanitizedData),
      'EX',
      REDIS_EX_8_HOURS
    );
    logger.info('Poll fetched from DB');

    return res.status(200).json({ success: true, result: sanitizedData });
  } catch (error) {
    return catchedError(res, error);
  }
};
