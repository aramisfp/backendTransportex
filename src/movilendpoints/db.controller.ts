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
        let result = this.dataService.empresas(filteredArray);
    return result;
  }
  /* A function that is called when the user makes a POST request to the endpoint /data/login. */
  @Post('login')
   async consultaLogin(@Query('client') userName: string, 
   @Body(){password, username, idEmpresa, id}: {password: string, username: string, idEmpresa: number, id:number}) { 
    console.log(userName, username, password);  
    const filteredArray = myArray.filter((obj) => obj.name === userName);        
    let result = this.dataService.login(filteredArray, password, username, idEmpresa, id);
   return result;  
  }

  /* A function that is called when the user makes a POST request to the endpoint /data/logout. */
  @Post('logout')
   async consultaLogout(@Query('client') userName: string, 
   @Body(){idEmpresa, ID_Conexion, Fecha_Sesion}: {idEmpresa: number, ID_Conexion: number, Fecha_Sesion: string}) { 
    console.log(userName);  
    const filteredArray = myArray.filter((obj) => obj.name === userName);        
    let result = this.dataService.logout(filteredArray, idEmpresa, ID_Conexion, Fecha_Sesion);
   return result;  
  }

  @Get('vehiculos')
    async consultaVehiculos(@Query('client') userName: string) {   
        const filteredArray = myArray.filter((obj) => obj.name === userName);        
        let result = this.dataService.vehiculos(filteredArray);
    return result;
  }
  @Get('usuarios')
    async consultaUsuarios(@Query('client') userName: string) {   
        const filteredArray = myArray.filter((obj) => obj.name === userName);        
        let result = this.dataService.usuarios(filteredArray);
    return result;
  }
  @Post('kilometraje')
  async consultaKilometraje(@Query('client') userName: string, 
  @Body(){id_vehiculo, kilometros, observaciones, horas, observaciones_horas, usuario_mod, 
    tipo, manual, id_viaje, act_cascada_cavas}: 
  {id_vehiculo: number, 
    kilometros: number,
    observaciones: string,
    horas: number, 
    observaciones_horas: string,
    usuario_mod: string,
    tipo: string,
    manual: number,
    id_viaje: number,
    act_cascada_cavas: number}) { 
   console.log(userName);  
   const filteredArray = myArray.filter((obj) => obj.name === userName);        
   let result = this.dataService.kilometraje(filteredArray, 
    id_vehiculo, 
    kilometros, 
    horas, 
    usuario_mod,
    tipo,
    manual);
  return result;  
 }
 @Post('permisos')
   async consultaPermisos(@Query('client') userName: string, 
   @Body(){idUser, columna}: {idUser: number, columna:string}) { 
    console.log(idUser, columna);  
    const filteredArray = myArray.filter((obj) => obj.name === userName);        
    let result = this.dataService.permisos(filteredArray, idUser, columna);
   return result;  
  }
  @Post('configuracion')
   async consultaConfiguracion(@Query('client') userName: string, 
   @Body(){idEmpresa, campo}: {idEmpresa: number, campo:string}) { 
    console.log(idEmpresa, campo);  
    const filteredArray = myArray.filter((obj) => obj.name === userName);        
    let result = this.dataService.configuracion(filteredArray, idEmpresa, campo);
   return result;  
  }
  
  @Get('actividadtipo')
    async consultaActividadtipo(@Query('client') userName: string) {   
        const filteredArray = myArray.filter((obj) => obj.name === userName);        
        let result = this.dataService.actividadtipo(filteredArray);
    return result;
  }
  @Get('empleados')
    async consultaEmpleados(@Query('client') userName: string) {   
        const filteredArray = myArray.filter((obj) => obj.name === userName);        
        let result = this.dataService.empleados(filteredArray);
    return result;
  }  
  @Get('novedades')
    async consultaNovedades(@Query('client') userName: string) {   
        const filteredArray = myArray.filter((obj) => obj.name === userName);        
        let result = this.dataService.novedades(filteredArray);
    return result;
  }  
    
}
