import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'server/db';
import { authorizationValidationMiddleware, errorHandlerMiddleware } from 'server/middlewares';
import { carValidationSchema } from 'validationSchema/cars';
import { convertQueryToPrismaUtil } from 'server/utils';
import { getServerSession } from '@roq/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId } = await getServerSession(req);
  switch (req.method) {
    case 'GET':
      return getCars();
    case 'POST':
      return createCar();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getCars() {
    const data = await prisma.car
      .withAuthorization({
        userId: roqUserId,
      })
      .findMany(convertQueryToPrismaUtil(req.query, 'car'));
    return res.status(200).json(data);
  }

  async function createCar() {
    await carValidationSchema.validate(req.body);
    const body = { ...req.body };
    if (body?.booking?.length > 0) {
      const create_booking = body.booking;
      body.booking = {
        create: create_booking,
      };
    } else {
      delete body.booking;
    }
    const data = await prisma.car.create({
      data: body,
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(authorizationValidationMiddleware(handler))(req, res);
}
