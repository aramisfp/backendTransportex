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
      Fecha_Sesion
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
  async consultaVehiculos(@Query('client') userName: string, @Query('Tipo_Carroceria') Tipo_Carroceria: string | null) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.vehiculos(filteredArray, 0, 0, Tipo_Carroceria);
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
    @Query('Tipo_Carroceria') Tipo_Carroceria: string | null
  ) {
    console.log(ID_Empleado);
    console.log('ID de la empresa', ID_Empresa_Session);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.vehiculos(filteredArray, ID_Empleado, ID_Empresa_Session, Tipo_Carroceria);
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

  @Get('repostajes')
  async consultaRepostajes(
    @Query('client') userName: string,
    @Query('ID_Empleado') ID_Empleado: number,
    @Query('ID_Empresa_Session') ID_Empresa_Session: number,
  ) {
    console.log(ID_Empleado);
    console.log('ID de la empresa', ID_Empresa_Session);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.repostajes(filteredArray, ID_Empleado, ID_Empresa_Session);
    return result;
  }

   @Post('repostajestotal')
  async consultaRepostajestotal(
    @Query('client') userName: string,
    @Body()
    {
      ID_Empleado,
      ID_Empresa_Sesion,
    }: { ID_Empleado: number; ID_Empresa_Sesion: number },
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.repostajestotal(
      filteredArray,
      ID_Empleado,
      ID_Empresa_Sesion,
    );
    return result;
  }
  
  @Get('actividadtipo')
  async consultaActividadtipo(@Query('client') userName: string) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.actividadtipo(filteredArray);
    return result;
  }
  @Get('empleados')
  async consultaEmpleados(
    @Query('client') userName: string,
    @Query() { ID_Empleado }: { ID_Empleado: number },
    @Query() { ID_Empresa_Sesion }: { ID_Empresa_Sesion: number },
  ) {
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
      modulo: body.modulo ?? 'ACS',
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
        body.modulo
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

  @Get('proveedores')
  async consultaProveedores(
    @Query('client') userName: string,
    @Body() { ID_Empresa_Sesion }: { ID_Empresa_Sesion: number },
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.proveedores(filteredArray, ID_Empresa_Sesion);
    return result;
  }
  
  @Get('repostajegastotipo')
  async consultaRepostajegastotipo(@Query('client') userName: string) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.repostajegastotipo(filteredArray);
    return result;
  }
  @Get('repostajecombustibletipo')
  async consultaRepostajecombustibletipo(@Query('client') userName: string) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.repostajecombustibletipo(filteredArray);
    return result;
  }
  @Get('repostajeformapago')
  async consultaRepostajeformapago(@Query('client') userName: string) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.repostajeformapago(filteredArray);
    return result;
  }
  @Get('repostajesconfig')
  async consultaRepostajesconfig(
    @Query('client') userName: string,
    @Query() { ID_Empresa_Sesion }: { ID_Empresa_Sesion: number },    
    ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.repostajesconfig(filteredArray, ID_Empresa_Sesion);
    return result;
  }

@Post('repostajeinput')
  async consultaRepostajeinput(
    @Query('client') userName: string,
    @Body()
    {
id_vehiculo_combustible, 
id_vehiculo,
cantidad_reposteo,
cantidad_reposteo_aut, 
cantidad_reposteo_enc,
precio_unitario,
valor_iva,
monto_descuento,
id_combustible_tipo,
tipo_movimiento,
forma_pago,
fecha_reposteo,
kilometraje_lectura,
horas_lectura,
id_proveedor,
id_empleado,
id_viaje,
factura,
campo2,
campo3,
campo4,
usuario,
observaciones,
    }: {
    id_vehiculo_combustible: number; 
    id_vehiculo: number;
    cantidad_reposteo: number;
    cantidad_reposteo_aut: number; 
    cantidad_reposteo_enc: number;
    precio_unitario: number;
    valor_iva: number;
    monto_descuento: number;
    id_combustible_tipo: number;
    tipo_movimiento: string;
    forma_pago: string;
    fecha_reposteo: string;
    kilometraje_lectura: number;
    horas_lectura: number;
    id_proveedor: number;
    id_empleado: number;
    id_viaje: number;
    factura: string;
    campo2: string;
    campo3: string;
    campo4: string;
    usuario: string;
    observaciones: string;
    },
  ) {
    
    console.log(userName);

    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.repostajeinput(
      filteredArray,
      id_vehiculo_combustible, 
      id_vehiculo,
      cantidad_reposteo,
      cantidad_reposteo_aut, 
      cantidad_reposteo_enc,
      precio_unitario,
      valor_iva,
      monto_descuento,
      id_combustible_tipo,
      tipo_movimiento,
      forma_pago,
      `'${fecha_reposteo}'`,
      kilometraje_lectura,
      horas_lectura,
      id_proveedor,
      id_empleado,
      id_viaje,
      factura,
      campo2,
      campo3,
      campo4,
      usuario,
      observaciones,
    );
    return result;
  }  

   @Get('repostajeimpresion')
  async consultarepostajeimpresion(
    @Query('client') userName: string,
    @Query() { ID_Repostaje }: { ID_Repostaje: number },
    @Query() { ID_Usuario }: { ID_Usuario: number },
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.repostajeimpresion(filteredArray, ID_Repostaje, ID_Usuario);
    return result;
  } 

 @Post('repostajeimpresionsec')
  async consultarepostajeimpresionsec(
    @Query('client') userName: string,
    @Body()
    { ID_Repostaje }: { ID_Repostaje: number },
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.repostajeimpresionsec(
      filteredArray,
      ID_Repostaje,
    );
    return result;
  }  

 @Get('neumaticosespesorpresion')
  async consultaNeumaticosespesorpresion(
    @Query('client') userName: string,
    @Query() { ID_Vehiculo }: { ID_Vehiculo: number },
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.neumaticosespesorpresion(filteredArray, ID_Vehiculo);
    return result;
  }  
  @Get('neumaticostipofallas')
  async consultaNeumaticostipofallas(@Query('client') userName: string) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.neumaticostipofallas(filteredArray);
    return result;
  }  

@Post('neumaticosespesorpresioninput')
  async consultaNeumaticosespesorpresioninput(
    @Query('client') userName: string,
    @Body()
    {
id_neumatico, 
espesor,
espesor_fecha_act,
espesor_observaciones, 
presion,
presion_fecha_act,
presion_observaciones,
tiene_tapon,
id_neumatico_falla_tipo,
usuario,
    }: {
    id_neumatico: number; 
    espesor: number;
    espesor_fecha_act: string;
    espesor_observaciones: string;
    presion: number; 
    presion_fecha_act: string;
    presion_observaciones: string;
    tiene_tapon: number;
    id_neumatico_falla_tipo: number;
    usuario: string;
    },
  ) {
    
    console.log(userName);

    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.neumaticosespesorpresioninput(
      filteredArray,
id_neumatico, 
espesor,
`'${espesor_fecha_act}'`,
espesor_observaciones, 
presion,
`'${presion_fecha_act}'`,
presion_observaciones,
tiene_tapon,
id_neumatico_falla_tipo,
usuario,
    );
    return result;
  }  


@Post('neumaticosespesorpresionerrorinput')
  async consultaNeumaticosespesorpresionerrorinput(
    @Query('client') userName: string,
    @Body()
    {
id_neumatico, 
identificacion_escrita, 
espesor,
espesor_observaciones, 
presion,
presion_observaciones,
tiene_tapon,
id_neumatico_falla_tipo,
usuario,
    }: {
    id_neumatico: number; 
    identificacion_escrita: string;
    espesor: number;
    espesor_observaciones: string;
    presion: number; 
    presion_observaciones: string;
    tiene_tapon: number;
    id_neumatico_falla_tipo: number;
    usuario: string;
    },
  ) {
    
    console.log(userName);

    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.neumaticosespesorpresionerrorinput(
      filteredArray,
id_neumatico, 
identificacion_escrita,
espesor,
espesor_observaciones, 
presion,
presion_observaciones,
tiene_tapon,
id_neumatico_falla_tipo,
usuario,
    );
    return result;
  }  


  
  @Get('appbdversion')
  async consultaAppbdversion(@Query('client') userName: string) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.appbdversion(filteredArray);
    return result;
  }  
 @Get('appbdmodulos')
  async consultaAppbdmodulos(@Query('client') userName: string) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.appbdmodulos(filteredArray);
    return result;
  }  


   @Get('documentosvencidos')
  async consultaDocumentosvencidos(
    @Query('client') userName: string,
    @Query() { ID_Empleado }: { ID_Empleado: number },
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.documentosvencidos(filteredArray, ID_Empleado);
    return result;
  }  

@Post('documentosvencidosinput')
  async consultaDocumentosvencidosinput(
    @Query('client') userName: string,
    @Body()
    {
naturaleza,
id_elemento, 
id_tipo_documento,
numero,
fecha_emision, 
fecha_documento,
costo_tramite,
observaciones,
usuario,
    }: {
    naturaleza: string; 
    id_elemento: number;
    id_tipo_documento: number;
    numero: string;
    fecha_emision: string;
    fecha_documento: string;
    costo_tramite: number;
    observaciones: string;
    usuario: string;
    },
  ) {
    
    console.log(userName);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.documentosvencidosinput(
      filteredArray,
naturaleza,
id_elemento, 
id_tipo_documento,
numero,
fecha_emision, 
fecha_documento,
costo_tramite,
observaciones,
usuario,
    );
    return result;
  }  


  
  
   @Get('viajelistado')
  async consultaViajelistado(
    @Query('client') userName: string,
    @Query() { ID_Empleado }: { ID_Empleado: number },
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.viajelistado(filteredArray, ID_Empleado);
    return result;
  }  

  
   @Get('viajedetalles')
  async consultaViajedetalles(
    @Query('client') userName: string,
    @Query() { ID_Viaje }: { ID_Viaje: number },
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.viajedetalles(filteredArray, ID_Viaje);
    return result;
  }  
  

@Post('viajepermisoentsal')
  async consultaViajepermisoentsal(
    @Query('client') userName: string,
    @Body()
    {
id_viaje,
id_empleado,
    }: {
    id_viaje: number;
    id_empleado: number;
    },
  ) {
    
    console.log(userName);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.viajepermisoentsal(
      filteredArray,
id_viaje,
id_empleado,
    );
    return result;
  }  


  
@Post('viajeentradasalidainput')
  async consultaViajeentradasalidainput(
    @Query('client') userName: string,
    @Body()
    {
id_viaje,
tipo,
observaciones,
latitud,
longitud,
computador,
usuario,
latitud_escaneador,
longitud_escaneador,
estado_gps_conductor,
estado_gps_escaneador,
metros_distancia_escaneo,
    }: {
    id_viaje: number;
    tipo: string; 
    observaciones: string;
    latitud: string;
    longitud: string;
    computador: string;
    usuario: string;
    latitud_escaneador: string;
    longitud_escaneador: string;
    estado_gps_conductor: string;
    estado_gps_escaneador: string;
    metros_distancia_escaneo: number;
    },
  ) {
    console.log(userName);
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.viajeentradasalidainput(
      filteredArray,
id_viaje,
tipo,
observaciones,
latitud,
longitud,
computador,
usuario,
latitud_escaneador,
longitud_escaneador,
estado_gps_conductor,
estado_gps_escaneador,
metros_distancia_escaneo,
    );
    return result;
  }  



   
   @Get('viajesolnueva')
  async consultaViajesolnueva(
    @Query('client') userName: string,
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.viajesolnueva(filteredArray);
    return result;
  }  

  

   @Get('viajesoledit')
  async consultaViajesoledit(
    @Query('client') userName: string,
    @Query() { ID_Viaje_Solicitud }: { ID_Viaje_Solicitud: number },
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.viajesoledit(filteredArray, ID_Viaje_Solicitud);
    return result;
  }  


  
@Post('viajesolinput')
  async consultaViajesolinput(
    @Query('client') userName: string,
    @Body()
    {
id_viaje_solicitud,   
id_empleado,   
id_ciudad_origen,   
id_ciudad_destino,   
id_vehiculo_sel,
id_vehiculo_uso,   
id_vehiculo_uso_cava,   
id_vehiculo_tipo,   
id_vehiculo_tipo_cava,   
id_empresa,   
id_empresa_despacho,   
id_viaje_carga_tipo,   
id_medida_pieza,   
fecha_solicitud,   
fecha_salida,   
fecha_salida_estimada,   
fecha_llegada_estimada,
fecha_llegada,
fecha_entrega,
guia_numero,   
numero_relacion_gastos,   
factura_guia,   
campo_especial3,   
campo_especial4,   
descripcion,   
fecha_embarque,   
factura_flete,
barco_nro_viaje,
barco_nombre,
carga_cargado,
fecha_factura_flete,
fecha_factura_afiliado, 
monto_flete_cotizado,
pieza_cantidad,   
peso,   
peso_medida,   
pasajeros,   
largo,   
ancho,   
alto,   
longitud_medida,   
volumen,   
volumen_medida,   
repartos_internos,   
repartos_externos,   
observaciones, 
custodia,
marchamo,
marchamo_serial, 
observaciones_viaje, 
tipo_origen,
solicitud_referencia, 
carga_peligrosa, 
usuario,
id_empresa_registro,
    }: {
id_viaje_solicitud: number;
id_empleado: number;    
id_ciudad_origen: number;
id_ciudad_destino: number;
id_vehiculo_sel: number;
id_vehiculo_uso: number;
id_vehiculo_uso_cava: number;
id_vehiculo_tipo: number;
id_vehiculo_tipo_cava: number;
id_empresa: number;
id_empresa_despacho: number;   
id_viaje_carga_tipo: number;
id_medida_pieza: number;   
fecha_solicitud: string;
fecha_salida: string;  
fecha_salida_estimada: string;   
fecha_llegada_estimada: string;
fecha_llegada: string;
fecha_entrega: string;
guia_numero: string;   
numero_relacion_gastos: string;   
factura_guia: string;   
campo_especial3: string;
campo_especial4: string;   
descripcion: string;   
fecha_embarque: string;   
factura_flete: string;
barco_nro_viaje: string;
barco_nombre: string;
carga_cargado: string;
fecha_factura_flete: string;
fecha_factura_afiliado: string;
monto_flete_cotizado: number;
pieza_cantidad: number; 
peso: number;
peso_medida: string;   
pasajeros: number;   
largo: number;   
ancho: number;   
alto: number;   
longitud_medida: string;
volumen: number;
volumen_medida: string;   
repartos_internos: number; 
repartos_externos: number;   
observaciones: string;
custodia: string;
marchamo: string;
marchamo_serial: string;
observaciones_viaje: string;
tipo_origen: string;
solicitud_referencia: string; 
carga_peligrosa: string; 
usuario: string;
id_empresa_registro: number;      
    },
  ) {
    
    console.log(userName);

    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.viajesolinput(
      filteredArray,
id_viaje_solicitud,      
id_empleado,   
id_ciudad_origen,   
id_ciudad_destino,   
id_vehiculo_sel,
id_vehiculo_uso,   
id_vehiculo_uso_cava,   
id_vehiculo_tipo,   
id_vehiculo_tipo_cava,   
id_empresa,   
id_empresa_despacho,   
id_viaje_carga_tipo,   
id_medida_pieza,   
fecha_solicitud,   
fecha_salida,   
fecha_salida_estimada,   
fecha_llegada_estimada,
fecha_llegada,
fecha_entrega,
guia_numero,   
numero_relacion_gastos,   
factura_guia,   
campo_especial3,   
campo_especial4,   
descripcion,   
fecha_embarque,   
factura_flete,
barco_nro_viaje,
barco_nombre,
carga_cargado,
fecha_factura_flete,
fecha_factura_afiliado, 
monto_flete_cotizado,
pieza_cantidad,   
peso,   
peso_medida,   
pasajeros,   
largo,   
ancho,   
alto,   
longitud_medida,   
volumen,   
volumen_medida,   
repartos_internos,   
repartos_externos,   
observaciones, 
custodia,
marchamo,
marchamo_serial, 
observaciones_viaje, 
tipo_origen,
solicitud_referencia, 
carga_peligrosa, 
usuario,
id_empresa_registro,
    );
    return result;
  }  




    
@Post('viajesoldelete')
  async consultaViajesoldelete(
    @Query('client') userName: string,
    @Body()
    {
id_viaje_solicitud,  
    }: {
id_viaje_solicitud: number;   
    },
  ) {
    
    console.log(userName);

    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.viajesoldelete(
      filteredArray,
id_viaje_solicitud, 
    );
    return result;
  }  

  

   @Get('viajesollistado')
  async consultaViajesollistado(
    @Query('client') userName: string,
    @Query() { ID_Empleado }: { ID_Empleado: number },
    @Query() { ID_Usuario }: { ID_Usuario: number },
    @Query() { ID_Empresa_Sesion }: { ID_Empresa_Sesion: number },
  ) {
    const filteredArray = myArray.filter((obj) => obj.name === userName);
    const result = this.dataService.viajesollistado(filteredArray, ID_Empleado, ID_Usuario, ID_Empresa_Sesion);
    return result;
  }  
  
}
