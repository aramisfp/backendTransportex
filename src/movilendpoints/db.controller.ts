import { Controller, Get, Post, Query } from '@nestjs/common';
import {
  Body,
  Delete,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { myArray } from 'src/users.array';
import { DataService } from './db.service';
import {
  CreateNoveltyInputDto,
  DeleteFileInputDto,
  DeleteNoveltyInputDto,
  EditNoveltyInputDto,
  UploadedItemDto,
} from './dto/noveltyInput.dto';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}
  /* A function that is called when the user makes a GET request to the endpoint /data/empresas. */
  @Get('empresas')
  async consultaEmpresas(@Query('client') userName: string) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.empresas(filteredArray);
    return result;
  }
  /* A function that is called when the user makes a POST request to the endpoint /data/login. */
  @Post('login')
  async consultaLogin(
    @Query('client') userName: string,
    @Body()
    {
      password,
      username,
      idEmpresa,
      id,
    }: { password: string; username: string; idEmpresa: number; id: number },
  ) {
    console.log(userName, username, password);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.login(
      filteredArray,
      password,
      username,
      idEmpresa,
      id,
    );
    return result;
  }

  /* A function that is called when the user makes a POST request to the endpoint /data/logout. */
  @Post('logout')
  async consultaLogout(
    @Query('client') userName: string,
    @Body()
    {
      idEmpresa,
      ID_Conexion,
      Fecha_Sesion,
    }: { idEmpresa: number; ID_Conexion: number; Fecha_Sesion: string },
  ) {
    console.log(userName);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.logout(
      filteredArray,
      idEmpresa,
      ID_Conexion,
      Fecha_Sesion,
    );
    return result;
  }
  @Get('vehiculos')
  async consultaVehiculos(@Query('client') userName: string) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.vehiculos(filteredArray, 0, 0);
    return result;
  }
  // @Post('vehiculos')
  // async consultaVehiculosAsig(
  //   @Query('client') userName: string,
  //   @Body() { ID_Empleado }: { ID_Empleado: number },
  // ) {
  //   console.log(ID_Empleado);
  //   const filteredArray = myArray.filter((obj) => obj.name === userName);
  //   const result = this.dataService.vehiculos(filteredArray, ID_Empleado);
  //   return result;
  // }
  @Get('vehiculosAsignados')
  async consultaVehiculosAsig(
    @Query('client') userName: string,
    @Query('ID_Empleado') ID_Empleado: number,
    @Query('ID_Empresa_Session') ID_Empresa_Session: number,
  ) {
    console.log(ID_Empleado);
    console.log('ID de la empresa', ID_Empresa_Session);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.vehiculos(filteredArray, ID_Empleado, ID_Empresa_Session);
    return result;
  }
  @Get('usuarios')
  async consultaUsuarios(@Query('client') userName: string) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.usuarios(filteredArray);
    return result;
  }
  @Post('kilometraje')
  async consultaKilometraje(
    @Query('client') userName: string,
    @Body()
    {
      id_vehiculo,
      kilometros,
      observaciones,
      horas,
      observaciones_horas,
      usuario_mod,
      tipo,
      manual,
      id_viaje,
      act_cascada_cavas,
    }: {
      id_vehiculo: number;
      kilometros: number;
      observaciones: string;
      horas: number;
      observaciones_horas: string;
      usuario_mod: string;
      tipo: string;
      manual: number;
      id_viaje: number;
      act_cascada_cavas: number;
    },
  ) {
    console.log(userName);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.kilometraje(
      filteredArray,
      id_vehiculo,
      kilometros,
      horas,
      usuario_mod,
      tipo,
      manual,
    );
    return result;
  }
  @Post('permisos')
  async consultaPermisos(
    @Query('client') userName: string,
    @Body() { idUser, columna }: { idUser: number; columna: string },
  ) {
    console.log(idUser, columna);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.permisos(filteredArray, idUser, columna);
    return result;
  }
  @Post('configuracion')
  async consultaConfiguracion(
    @Query('client') userName: string,
    @Body() { idEmpresa, campo }: { idEmpresa: number; campo: string },
  ) {
    console.log(idEmpresa, campo);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.configuracion(
      filteredArray,
      idEmpresa,
      campo,
    );
    return result;
  }
  @Get('actividadTipo')
  async getActivityType(@Query('client') userName: string) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.actividadtipo(filteredArray);
    return result;
  }
  @Get('novedades')
  async getNoveltyList(
    @Query('client') userName: string,
    @Query('idEmployer') idEmployer: string,
    @Query('order') order: string,
    @Query('ID_Empresa_Session') ID_Empresa_Session: number,
  ) {
    console.log('ID de la empresa', ID_Empresa_Session);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.novedades(filteredArray, idEmployer, order, ID_Empresa_Session);
    return result;
  }
  @Post('novedadestotal')
  async consultaNovedadestotal(
    @Query('client') userName: string,
    @Body()
    {
      ID_Empleado,
      todas,
      ID_Empresa_Sesion,
    }: { ID_Empleado: number; todas: number; ID_Empresa_Sesion: number },
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.novedadestotal(
      filteredArray,
      ID_Empleado,
      todas,
      ID_Empresa_Sesion,
    );
    return result;
  }
  @Post('novedades')
  async createNovelty(
    @Query('client') userName: string,
    @Body() body: CreateNoveltyInputDto,
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const {
      id_actividad_solicitud,
      id_vehiculo,
      id_actividad_grupo,
      id_empleado_solicitud,
      urgente,
      descripcion,
      usuario_str,
      id_empresa_sesion,
    } = body;
    const result = this.dataService.novedadinput(
      filteredArray,
      id_actividad_solicitud,
      id_vehiculo,
      id_actividad_grupo,
      id_empleado_solicitud,
      urgente,
      descripcion,
      usuario_str,
      id_empresa_sesion,
    );
    return result;
  }
  @Put('editNovedades')
  async editNovelty(
    @Query('client') userName: string,
    @Body() body: EditNoveltyInputDto,
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const {
      id_actividad_solicitud,
      urgente,
      descripcion,
      usuario_str,
      id_empresa_sesion,
    } = body;
    const defaultValue = 0;
    const id_vehiculo = defaultValue;
    const id_actividad_grupo = defaultValue;
    const id_empleado_solicitud = defaultValue;
    console.log(typeof urgente);

    const result = this.dataService.novedadinput(
      filteredArray,
      id_actividad_solicitud,
      id_vehiculo,
      id_actividad_grupo,
      id_empleado_solicitud,
      urgente,
      descripcion,
      usuario_str,
      id_empresa_sesion,
    );
    return result;
  }
  @Delete('deleteNovedades')
  async deleteNovelty(
    @Query('client') userName: string,
    @Body() body: DeleteNoveltyInputDto,
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const { id_actividad_solicitud, usuario_str, id_empresa_sesion } = body;
    const defaultValue = 0;
    const id_vehiculo = defaultValue;
    const id_actividad_grupo = defaultValue;
    const id_empleado_solicitud = defaultValue;
    const urgente = defaultValue;
    const descripcion = '_BLANK_';

    const result = this.dataService.novedadinput(
      filteredArray,
      id_actividad_solicitud,
      id_vehiculo,
      id_actividad_grupo,
      id_empleado_solicitud,
      urgente,
      descripcion,
      usuario_str,
      id_empresa_sesion,
    );
    return result;
  }

  @Get('actividadtipo')
  async consultaActividadtipo(@Query('client') userName: string) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.actividadtipo(filteredArray);
    return result;
  }
  @Post('empleados')
  async consultaEmpleados(
    @Query('client') userName: string,
    @Body() { ID_Empleado }: { ID_Empleado: number },
    @Body() { ID_Empresa_Sesion }: { ID_Empresa_Sesion: number },
  ) {
    console.log(ID_Empleado);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.empleados(filteredArray, ID_Empleado, ID_Empresa_Sesion);
    return result;
  }
  @Post('uploadedFile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadedFile(
    @Query('client') userName: string,
    @UploadedFile() file,
    @Body() body: UploadedItemDto,
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const dataToSend = {
      id_archivo: 0,
      id_key_modulo: body.id_key_modulo,
      modulo: 'ACS',
      nombre_archivo: body.name,
      usuario_str: body.usuario_str,
    };
    const saveData = await this.dataService.archivoinput(
      filteredArray,
      dataToSend.id_archivo,
      dataToSend.id_key_modulo,
      dataToSend.modulo,
      dataToSend.nombre_archivo,
      dataToSend.usuario_str,
    );
    if (Array.isArray(saveData) && saveData.length > 0) {
      // const blob = new Blob(file.buffer);
      const result = this.dataService.archivoUpdate(
        filteredArray,
        saveData[0].ID_Archivo,
        file.buffer,
      );
      return result;
    } else {
      return saveData;
    }
  }

  @Post('archivos')
  async consultaArchivos(
    @Query('client') userName: string,
    @Body()
    { ID_Key, Modulo_Letras }: { ID_Key: number; Modulo_Letras: string },
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.archivos(
      filteredArray,
      ID_Key,
      Modulo_Letras,
    );
    return result;
  }
  @Delete('deleteFile')
  async deleteFile(
    @Query('client') userName: string,
    @Body() body: DeleteFileInputDto,
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = await this.dataService.archivoinput(
      filteredArray,
      body.id_archivo,
      0,
      null,
      null,
      null,
    );
    return result;
  }
  //endpoint de prueba
  @Get('test')
  async getTets(
    @Query('client') userName: string,
    @Query('idEmployer') idEmployer: string,
    @Query('ID_Empleado') ID_Empleado: string,
    @Query('order') order: string,
    @Query('ID_Empresa_Session') ID_Empresa_Session: number,
  ) {
    console.group('Querys:');
    console.log('client:', userName);
    console.log('idEmployer:', idEmployer); // esto es lo mismo que ID_Empleado solo que otro query
    console.log('ID_Empleado:', ID_Empleado); // esto es lo mismo que idEmployer solo que otro query
    console.log('order:', order);
    console.log('ID_Empresa_Session:', ID_Empresa_Session);
    console.groupEnd();
    return { message: 'este es un endpoint de prueba' };
  }
}
