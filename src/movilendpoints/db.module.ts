import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DataService } from './db.service';
import { DataController } from './db.controller';


@Module({  
  providers: [
    PrismaService,
    DataService,     
  ],
  controllers: [DataController],
  
})
export class DbModule {}
