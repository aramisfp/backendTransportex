import { Controller, Get, Post, Query } from '@nestjs/common';
import { Body, Delete, Put } from '@nestjs/common/decorators';
import { myArray } from 'src/users.array';
import { DataService } from './db.service';
import {
  CreateNoveltyInputDto,
  DeleteNoveltyInputDto,
  EditNoveltyInputDto,
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
    const result = this.dataService.vehiculos(filteredArray, 0);
    return result;
  }
  @Post('vehiculos')
  async consultaVehiculosAsig(
    @Query('client') userName: string,
    @Body() { ID_Empleado }: { ID_Empleado: number },
  ) {
    console.log(ID_Empleado);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.vehiculos(filteredArray, ID_Empleado);
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
  async getNoveltyList(@Query('client') userName: string) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.novedades(filteredArray, 1, 0);
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
  ) {
    console.log(ID_Empleado);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.empleados(filteredArray, ID_Empleado);
    return result;
  }
  @Post('novedades')
  async consultaNovedades(
    @Query('client') userName: string,
    @Body() { ID_Empleado, todas }: { ID_Empleado: number; todas: number },
  ) {
    console.log(ID_Empleado, todas);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.novedades(
      filteredArray,
      ID_Empleado,
      todas,
    );
    return result;
  }
  // @Post('novedadinput')
  // async consultaNovedadinput(
  //   @Query('client') userName: string,
  //   @Body()
  //   {
  //     id_actividad_solicitud,
  //     id_vehiculo,
  //     id_actividad_grupo,
  //     id_empleado_solicitud,
  //     urgente,
  //     descripcion,
  //     usuario_str,
  //     id_empresa_sesion,
  //   }: {
  //     id_actividad_solicitud: number;
  //     id_vehiculo: number;
  //     id_actividad_grupo: number;
  //     id_empleado_solicitud: number;
  //     urgente: number;
  //     descripcion: string;
  //     usuario_str: string;
  //     id_empresa_sesion: number;
  //   },
  // ) {
  //   console.log(userName);
  //   const filteredArray = myArray.filter((obj) => obj.name === userName);
  //   const result = this.dataService.novedadinput(
  //     filteredArray,
  //     id_actividad_solicitud,
  //     id_vehiculo,
  //     id_actividad_grupo,
  //     id_empleado_solicitud,
  //     urgente,
  //     descripcion,
  //     usuario_str,
  //     id_empresa_sesion,
  //   );
  //   return result;
  // }
  @Post('archivoinput')
  async consultaArchivoinput(
    @Query('client') userName: string,
    @Body()
    {
      id_archivo,
      id_key_modulo,
      modulo,
      nombre_archivo,
      usuario_str,
    }: {
      id_archivo: number;
      id_key_modulo: number;
      modulo: string;
      nombre_archivo: string;
      usuario_str: string;
    },
  ) {
    console.log(userName);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.archivoinput(
      filteredArray,
      id_archivo,
      id_key_modulo,
      modulo,
      nombre_archivo,
      usuario_str,
    );
    return result;
  }
}
