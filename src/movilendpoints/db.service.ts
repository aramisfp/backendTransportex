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
  async general(object, query) {
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
  
      const result = await request.query(query);
  
      console.log(result.recordset);
  
      await pool.close();
  
      console.log('Disconnected from the database');

      return result.recordset;

      }catch(err){
        console.log(err);
        return err.message;
      }
         
      
    } catch (err) {
      console.error(err);
      return err.message;
    }
  }
  async empresas(object){
    const query = 'select Nombre, Tipo, Multiempresa, Activa, ID_Empresa from dbo.V_BI_EMPRESAS where Multiempresa= \'Si\'';
    let result = await this.general(object, query);
    return result;
  }
  async login(object, password, username, idEmpresa) {
    const query = `Exec [dbo].[SP_INS_SESION_LOGIN] ${0}, ${username}, ${password}, ${idEmpresa}, ${null}`;
    let result = await this.general(object, query);
    return result;
  }
  async configuracion(object, idEmpresa, campo) {
    const query = `Exec [dbo].[F_GETCONFIGVALUE]  ${campo}, ${idEmpresa}`;
    let result = await this.general(object, query);
    return result;
  }
  async logout(object, idEmpresa, ID_Conexion, Fecha_Sesion) {
    const date = new Date();
    const sqlDate = date.toISOString().replace('T', ' ').replace('Z', '');
    const query = `Exec [dbo].[SP_INS_SESION_LOGOUT] ${idEmpresa}, ${ID_Conexion}, '${Fecha_Sesion}'`;
    console.log(sqlDate);
    let result = await this.general(object, query);
    return result;
  }
  async vehiculos(object){
    const query = 'select ID_Vehiculo, Identificador_Vehiculo, Identificador_Secundario, Marca, Modelo, Anio, Propietario, Afiliado_o_Propio, Tipo_de_Vehiculo, Uso_de_Vehiculo, Automotor, Conductor, Conductor_Secundario, Centro_de_Costo, Unidad_de_Negocio, Contrato, Sede, VIN, Serial_Motor, Estado, Kilometraje, Ultima_Fecha_Act_Kilometraje, Horas_de_Uso, Ultima_Fecha_Act_Horas, Remolques_Asignados, Tipo_de_Combustible, Empresa_Ambiente, ID_Empleado, ID_Empleado_2 from dbo.V_BI_VEHICULOS';
    let result = await this.general(object, query);
    return result;
  }
  async usuarios(object){
    const query = 'select ID_Usuario, Nombre_Usuario, Administrador from dbo.V_USUARIO';
    let result = await this.general(object, query);
    return result;
  }
  async kilometraje(object, 
    id_vehiculo, 
    kilometros, 
    observaciones, 
    horas, 
    observaciones_horas, 
    usuario_mod,
    tipo,
    manual,
    id_viaje,
    act_cascada_cavas) {
    const date = new Date();
    const sqlDate = date.toISOString().replace('T', ' ').replace('Z', '');
    const query = `Exec [dbo].[SP_UPD_VEHICULO_KILOMETRAJE_HORA] 
    ${id_vehiculo}, 
    ${kilometros}, 
    '${observaciones}', 
    ${horas}, 
    '${observaciones_horas}',
    '${usuario_mod}',
    '${sqlDate}',
    '${tipo}',
    ${manual},
    ${id_viaje},
    ${act_cascada_cavas},
    '${sqlDate}',
    '${sqlDate}'`;
    let result = await this.general(object, query);
    return result;
  }
  async permisos(object, idUser, columna){
    const query = `select dbo.F_SESION_USUARIO_PERMISO(${idUser}, '${columna}')`;
    let result = await this.general(object, query);
    return result;
  }
  async actividadtipo(object){
    const query = 'select ID_Actividad_Tipo, Descripcion from dbo.V_ACTIVIDAD_TIPO';
    let result = await this.general(object, query);
    return result;
  }
  async empleados(object){
    const query = 'select ID_Empleado, Nombre_Empleado, Codigo, Email, Cargo, Usuario, ID_Usuario from dbo.V_EMPLEADO';
    let result = await this.general(object, query);
    return result;
  }
}
