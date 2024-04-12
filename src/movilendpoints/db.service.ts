import { Injectable, Scope } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as sql from 'mssql';
import { PrismaService } from './prisma.service';

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
      const config: sql.config = {
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
      try {
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        console.log('Connected to the database');
        const request = pool.request();
        const result = await request.query(query);
        console.log(result.recordset);
        await pool.close();
        console.log('Disconnected from the database');
        return result.recordset;
      } catch (err) {
        console.log(err);
        return err.message;
      }
    } catch (err) {
      console.error(err);
      return err.message;
    }
  }
  async empresas(object) {
    const query =
      "select Nombre, Tipo, Multiempresa, Activa, ID_Empresa from dbo.V_BI_EMPRESAS where substring(Multiempresa,1,1) = 'S' and substring(Activa,1,1) = 'S' order by Nombre";
    const result = await this.general(object, query);
    return result;
  }
  async login(object, password, username, idEmpresa, id) {
    const query = `Exec [dbo].[SP_INS_SESION_LOGIN] ${id}, ${'_BLANK_'}, '${password}', ${idEmpresa}, ${null}`;
    console.log(query);
    const result = await this.general(object, query);
    return result;
  }
  async configuracion(object, idEmpresa, campo) {
    console.log(campo, idEmpresa);
    const query = `select [dbo].[F_GETCONFIGVALUE]('${campo}', ${idEmpresa})`;
    const result = await this.general(object, query);
    return result;
  }
  async logout(object, idEmpresa, ID_Conexion, Fecha_Sesion) {
    const date = new Date();
    const sqlDate = date.toISOString().replace('T', ' ').replace('Z', '');
    const query = `Exec [dbo].[SP_INS_SESION_LOGOUT] ${ID_Conexion}, '_BLANK_', '${Fecha_Sesion}'`;
    console.log(sqlDate);
    const result = await this.general(object, query);
    return result;
  }
  async vehiculos(object, ID_Empleado, ID_Empresa_Sesion) {
   const query = `select ID_Vehiculo, Identificador_Vehiculo, Identificador_Secundario, Marca, Modelo, Anio, Propietario, Afiliado_o_Propio, Tipo_de_Vehiculo, Uso_de_Vehiculo, Automotor, Conductor, Conductor_Secundario, Centro_de_Costo, Unidad_de_Negocio, Contrato, Sede, VIN, Serial_Motor, Estado, Kilometraje, Ultima_Fecha_Act_Kilometraje, Horas_de_Uso, Ultima_Fecha_Act_Horas, Remolques_Asignados, Tipo_de_Combustible, Empresa_Ambiente, ID_Empleado, ID_Empleado_2 
    from dbo.V_BI_VEHICULOS,
	(select min(usu_rel.ID_Usuario) as ID_Usuario from (select min(usuario.ID_USUARIO) as ID_Usuario from usuario, usuario_x_empleado 
	where ${ID_Empleado} > 0 and usuario_x_empleado.id_empleado = ${ID_Empleado} 
   and usuario_x_empleado.id_usuario = usuario.id_usuario and usuario.activo = 1
	union all
	select 0 as ID_Usuario where isnull(${ID_Empleado},0) in (0, -1)
	) as usu_rel
        ) as usuario_rel
    where ${ID_Empresa_Sesion} in (ID_Empresa_Registro, 0)
and (V_BI_VEHICULOS.ID_Sede is null or V_BI_VEHICULOS.ID_Sede in ( 
select esede.ID_SEDE 
from USUARIO_X_EMPLEADO as uxe, empleado as esede, USUARIO as usede, CONFIGURACION as config_filtro
where config_filtro.CAMPO = 'VEH_EMPSEDE_FILTRO'
and config_filtro.VALOR = 'S'
and esede.ID_EMPLEADO = uxe.ID_EMPLEADO
and uxe.ID_EMPRESA = ${ID_Empresa_Sesion}
and uxe.ID_USUARIO = usede.ID_USUARIO
and uxe.ID_USUARIO = usuario_rel.ID_Usuario
union all
select emsede.ID_CIUDAD
from EMPRESA_SEDE as emsede, USUARIO as usede, CONFIGURACION as config_filtro
where config_filtro.CAMPO = 'VEH_EMPSEDE_FILTRO'
and config_filtro.VALOR in ('N', case usede.ADMINISTRADOR when 1 then 'S' else CASE WHEN isnull(
	  (select esede.ID_SEDE from USUARIO_X_EMPLEADO as uxe, empleado as esede where esede.ID_EMPLEADO = uxe.ID_EMPLEADO
		and uxe.ID_EMPRESA = emsede.ID_EMPRESA
		and uxe.ID_USUARIO = usede.ID_USUARIO
		), 0) = 0 THEN 'S' ELSE 'N' END end)
and emsede.ID_EMPRESA = ${ID_Empresa_Sesion}
and usuario_rel.ID_Usuario in (usede.ID_USUARIO,0)
union all
select emsede.ID_CIUDAD
from EMPRESA as emsede, USUARIO as usede, CONFIGURACION as config_filtro
where config_filtro.CAMPO = 'VEH_EMPSEDE_FILTRO'
and config_filtro.VALOR in ('N', case usede.ADMINISTRADOR when 1 then 'S' else CASE WHEN isnull(
	  (select esede.ID_SEDE from USUARIO_X_EMPLEADO as uxe, empleado as esede where esede.ID_EMPLEADO = uxe.ID_EMPLEADO
		and uxe.ID_EMPRESA = emsede.ID_EMPRESA
		and uxe.ID_USUARIO = usede.ID_USUARIO
		), 0) = 0 THEN 'S' ELSE 'N' END end)
and emsede.ID_EMPRESA = ${ID_Empresa_Sesion}
and usuario_rel.ID_Usuario in (usede.ID_USUARIO,0)
)
)
order by case when isnull(ID_Empleado,-1) = ${ID_Empleado} then 0 else 1 end asc, case when isnull(ID_Empleado_2,-1) = ${ID_Empleado} then 0 else 1 end asc, 
Identificador_Vehiculo`;
    const result = await this.general(object, query);
    return result;
  }

  async usuarios(object) {
    const query =
      'select ID_Usuario, Nombre_Usuario, Administrador from dbo.V_USUARIO order by Nombre_Usuario';
    const result = await this.general(object, query);
    return result;
  }
  async kilometraje(
    object,
    id_vehiculo,
    kilometros,
    horas,
    usuario_mod,
    tipo,
    manual,
  ) {
    const query = `Exec [dbo].[SP_UPD_VEHICULO_KILOMETRAJE_HORA] 
    ${id_vehiculo}, 
    ${kilometros}, 
    'Actualizacion del kilometraje via movil', 
    ${horas},
    'Actualizacion de las horas de uso via movil',
    ${usuario_mod},
    ${null},
    '',            
    ${1},
    ${0},
    ${1},
    ${null},
    ${null}`;
    const result = await this.general(object, query);
    return result;
  }
  async permisos(object, idUser, columna) {
    const query = `select dbo.F_SESION_USUARIO_PERMISO(${idUser}, '${columna}')`;
    const result = await this.general(object, query);
    return result;
  }
  async actividadtipo(object) {
    const query =
      'select ID_Actividad_Tipo, Descripcion from dbo.V_ACTIVIDAD_TIPO order by Descripcion';
    const result = await this.general(object, query);
    return result;
  }
  async empleados(object, ID_Empleado, ID_Empresa_Sesion) {
    const query = `select ID_Empleado, Nombre_Empleado, Codigo, Email, Cargo, Usuario, ID_Usuario 
    from dbo.V_EMPLEADO 
    where ${ID_Empresa_Sesion} in (ID_Empresa_Registro, 0)
    order by case when ID_Empleado = ${ID_Empleado} then 0 else 1 end asc, Nombre_Empleado asc`;
    const result = await this.general(object, query);
    return result;
  }
  async novedades(object, ID_Empleado, todas, ID_Empresa_Sesion) {
    const query = `select ID_Actividad_Novedad, Vehiculo_Identificador_Primario, Empleado_Solicitud, Fecha_Solicitud, Antiguedad_Dias, Empleado_Asignacion, Fecha_Asignacion, Fecha_Asignacion_EnvioEmail, Fecha_Atencion, Descripcion, Actividad_Grupo, Estado, Estatus, Prioridad, Tipo, Urgente, ID_Hoja_Revision, Referencia, Observaciones_Cierre, Fecha_Cierre, Fecha_Creacion, Fecha_Modificacion, Usuario_Creacion, Usuario_Modificacion, ID_Vehiculo, ID_Empleado_Solicitud, ID_Empleado_Asignacion, ID_Usuario_Solicitud, ID_Actividad_Grupo, Actividades_Asociadas, Archivos_Adjuntos_Cantidad, Empresa_Ambiente, Vehiculo_Modelo 
    from dbo.F_SEL_ACTIVIDAD_SOLICITUD(0, ${ID_Empleado},1) 
    where ${ID_Empresa_Sesion} in (ID_Empresa_Registro, 0)
     order by 
     case Estatus when 'N' then 1 when 'Q' then 2  when 'T' then 3 when 'A' then 4 when 'C' then 5 else 99 end asc,
     case urgente when 'S' then 1 else 0 end desc,
     isnull(prioridad, 99) asc, 
     ID_Actividad_Novedad desc`;
    const result = await this.general(object, query);
    return result;
  }
  async novedadestotal(object, ID_Empleado, todas, ID_Empresa_Sesion) {
    const query = `select count(*) as TotalNovedades
    from dbo.F_SEL_ACTIVIDAD_SOLICITUD(0, ${ID_Empleado},1) 
    where ${ID_Empresa_Sesion} in (ID_Empresa_Registro, 0)`;
    const result = await this.general(object, query);
    return result;
  }
  async novedadinput(
    object,
    id_actividad_solicitud,
    id_vehiculo,
    id_actividad_grupo,
    id_empleado_solicitud,
    urgente,
    descripcion,
    usuario_str,
    id_empresa_sesion,
  ) {
    const query = `Exec dbo.[SP_UPD_SYNC_ACTIVIDAD_SOLICITUD] 
    ${id_actividad_solicitud}, 
    ${id_vehiculo}, 
    '_BLANK_', 
    ${id_actividad_grupo},
    '_BLANK_',
    ${id_empleado_solicitud},
    '_BLANK_',
    ${null},            
    ${urgente},
    '${descripcion}',
    '${usuario_str}',
    ${id_empresa_sesion}`;
    const result = await this.general(object, query);
    return result;
  }
  async archivoinput(
    object,
    id_archivo,
    id_key_modulo,
    modulo,
    nombre_archivo,
    usuario_str,
  ) {
    const query = `Exec dbo.[SP_INS_SYNC_ARCHIVO] 
    ${id_archivo}, 
    ${id_key_modulo}, 
    ${modulo},
    '${nombre_archivo}',
    '${usuario_str}'`;
    const result = await this.general(object, query);
    return result;
  }
  async archivoUpdate(object, id_archivo, nuevoContenido) {
    const query = `
    UPDATE dbo.ARCHIVO
    SET CONTENIDO =  0x${nuevoContenido.toString('hex')}
    WHERE id_archivo = ${id_archivo}
  `;
    const result = await this.general(object, query);
    return result;
  }
  async archivos(object, ID_Key, Modulo_Letras) {
    const query = `select id_archivo, nombre, fecha_ins, usuario_ins from archivo where id_key_modulo = ${ID_Key} and modulo = '${Modulo_Letras}' order by fecha_ins desc`;
    const result = await this.general(object, query);
    return result;
  }
}
