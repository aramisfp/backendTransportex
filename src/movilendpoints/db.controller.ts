import { Controller, Get, Req, Query, Post, Param } from '@nestjs/common';
import { Request } from 'express';
import { DataService } from './db.service';
import * as sql from 'mssql';
import { myArray } from 'src/users.array';
import { Body } from '@nestjs/common/decorators';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}
  /* A function that is called when the user makes a GET request to the endpoint /data/empresas. */
  @Get('empresas')
    async consultaEmpresas(@Query('client') userName: string) {   
        const filteredArray = myArray.filter((obj) => obj.name === userName);        
        let empresas = this.dataService.empresas(filteredArray);
    return empresas;
  }
  /* A function that is called when the user makes a POST request to the endpoint /data/login. */
  @Post('login')
   async consultaLogin(@Query('client') userName: string, 
   @Body(){password,    username}: {password: string, username: string}) { 
    console.log(userName, username, password);  
    const filteredArray = myArray.filter((obj) => obj.name === userName);        
    let empresas = this.dataService.login(filteredArray, password, username);
   return empresas;  
  }
  
    
}
