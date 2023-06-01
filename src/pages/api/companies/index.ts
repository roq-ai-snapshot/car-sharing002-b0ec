import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'server/db';
import { authorizationValidationMiddleware, errorHandlerMiddleware } from 'server/middlewares';
import { companyValidationSchema } from 'validationSchema/companies';
import { convertQueryToPrismaUtil } from 'server/utils';
import { getServerSession } from '@roq/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId } = await getServerSession(req);
  switch (req.method) {
    case 'GET':
      return getCompanies();
    case 'POST':
      return createCompany();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getCompanies() {
    const data = await prisma.company
      .withAuthorization({
        userId: roqUserId,
      })
      .findMany(convertQueryToPrismaUtil(req.query, 'company'));
    return res.status(200).json(data);
  }

  async function createCompany() {
    await companyValidationSchema.validate(req.body);
    const body = { ...req.body };
    if (body?.car?.length > 0) {
      const create_car = body.car;
      body.car = {
        create: create_car,
      };
    } else {
      delete body.car;
    }
    const data = await prisma.company.create({
      data: body,
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(authorizationValidationMiddleware(handler))(req, res);
}
