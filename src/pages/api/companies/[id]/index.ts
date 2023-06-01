import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'server/db';
import { errorHandlerMiddleware } from 'server/middlewares';
import { companyValidationSchema } from 'validationSchema/companies';
import { HttpMethod, convertMethodToOperation, convertQueryToPrismaUtil } from 'server/utils';
import { getServerSession } from '@roq/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId } = await getServerSession(req);
  await prisma.company
    .withAuthorization({ userId: roqUserId })
    .hasAccess(req.query.id as string, convertMethodToOperation(req.method as HttpMethod));

  switch (req.method) {
    case 'GET':
      return getCompanyById();
    case 'PUT':
      return updateCompanyById();
    case 'DELETE':
      return deleteCompanyById();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getCompanyById() {
    const data = await prisma.company.findFirst(convertQueryToPrismaUtil(req.query, 'company'));
    return res.status(200).json(data);
  }

  async function updateCompanyById() {
    await companyValidationSchema.validate(req.body);
    const data = await prisma.company.update({
      where: { id: req.query.id as string },
      data: {
        ...req.body,
      },
    });
    return res.status(200).json(data);
  }
  async function deleteCompanyById() {
    const data = await prisma.company.delete({
      where: { id: req.query.id as string },
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(handler)(req, res);
}
