import { Injectable, Scope } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class DataService {
  private prisma: PrismaClient;
  private prismaService: PrismaService;
  constructor(prismaService: PrismaService) {
    this.prismaService = prismaService;
  }

  async setConnection(connectionString: string): Promise<void> {
    console.log(connectionString);
    this.prisma = this.prismaService.createPrismaClient(connectionString);
    console.log(this.prisma);
    await this.prisma.$connect();
  }

  async getUsers() {
    return this.prisma.cIERRE_HISTORIAL.findMany();
  }

  // Agrega más métodos aquí para interactuar con tu base de datos usando `this.prisma`

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
