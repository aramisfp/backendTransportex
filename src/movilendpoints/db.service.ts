import { Injectable, Scope } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';
import * as sql from 'mssql';

@Injectable({ scope: Scope.REQUEST })
export class DataService {
  private prisma: PrismaClient;
  private prismaService: PrismaService;
  constructor(prismaService: PrismaService) {
    this.prismaService = prismaService;
  }

  /* A function that is called when the user makes a GET request to the endpoint /data/empresas. */
  async empresas(object) {
    try {
      /* Creating a connection to the database. */
      const config: sql.config ={
        user: object[0].UserID,
        password: object[0].UserPwd,
        server: object[0].Server,
        port: parseInt(object[0].Port),
        database: object[0].Database,
        options: {
          enableArithAbort: true,
          trustServerCertificate: true,
        },
      };
        try{
        
      const pool = new sql.ConnectionPool(config);

      await pool.connect();
  
      console.log('Connected to the database');
  
      const request = pool.request();
  
      const result = await request.query('select * from [dbo].[V_BI_EMPRESAS] where Multiempresa= \'Si\'');
  
      console.log(result.recordset);
  
      await pool.close();
  
      console.log('Disconnected from the database');

      return result.recordset;

      }catch(err){
        console.log(err);
        return [];
      }
         
      
    } catch (err) {
      console.error(err);
      return [];
    }
  }
  async login(object, password, username) {
    try {
      /* Creating a connection to the database. */
      const config: sql.config ={
        user: object[0].UserID,
        password: object[0].UserPwd,
        server: object[0].Server,
        port: parseInt(object[0].Port),
        database: object[0].Database,
        options: {
          enableArithAbort: true,
          trustServerCertificate: true,
        },
      };
        try{
        
      const pool = new sql.ConnectionPool(config);

      await pool.connect();
  
      console.log('Connected to the database');
  
      const request = pool.request();
  
      const result = await request.query(`Exec [dbo].[SP_INS_SESION_LOGIN] ${0}, ${username}, ${password}, ${1}, ${null}`);
  
      console.log(result.recordset);
  
      await pool.close();
  
      console.log('Disconnected from the database');

      return result.recordset;

      }catch(err){
        console.log(err.message);
        return err.message;
      }
         
      
    } catch (err) {
      console.error(err.message);
      return err.message;
    }
  }
}
