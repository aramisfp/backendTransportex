import { PrismaClient } from '@prisma/client';

export class PrismaService {
  createPrismaClient(connectionString: string): PrismaClient {
    const client = new PrismaClient({
      datasources: {
        db: {
          url: connectionString,
        },
      },
    });
    console.log(client)
  
    return client;
  }
}

