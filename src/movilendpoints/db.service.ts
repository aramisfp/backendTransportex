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
and Estado = 'Activo'
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
  async repostajes(object, ID_Empleado, ID_Empresa_Sesion) {
   const query = `
   SELECT vehiculo_combustible.id_vehiculo_combustible,   
         vehiculo_combustible.id_vehiculo,   
         vehiculo_combustible.id_proveedor,   
         vehiculo_combustible.fecha_reposteo,   
		vehiculo.placa as Identificador_Vehiculo,
         vehiculo_combustible.cantidad_reposteo,   
         vehiculo_combustible.costo_unitario,  
combustible_tipo.descripcion as combustible_tipo_desc, 
( vehiculo_combustible.costo_unitario *  cantidad_reposteo ) + (vehiculo_combustible.costo_unitario *  cantidad_reposteo *  isnull(vehiculo_combustible.valor_iva,0) / 100)    as subtotal ,		 
vehiculo_combustible.monto_iva,
vehiculo_combustible.monto_descuento,
         vehiculo_combustible.kilometraje_lectura,   
vehiculo_combustible.horas_lectura,

( 
   select top 1 x.fecha_reposteo  from VEHICULO_COMBUSTIBLE as x where x.ID_VEHICULO = VEHICULO_COMBUSTIBLE.id_vehiculo and x.FECHA_REPOSTEO < VEHICULO_COMBUSTIBLE.FECHA_REPOSTEO
   order by x.FECHA_REPOSTEO desc) as Fecha_Reposteo_Anterior,
( 
   select top 1 x.cantidad_reposteo  from VEHICULO_COMBUSTIBLE as x where x.ID_VEHICULO = VEHICULO_COMBUSTIBLE.id_vehiculo and x.FECHA_REPOSTEO < VEHICULO_COMBUSTIBLE.FECHA_REPOSTEO
   order by x.FECHA_REPOSTEO desc) as Cantidad_Reposteo_Anterior,

isnull((select vc.KILOMETRAJE_LECTURA
from VEHICULO_COMBUSTIBLE as vc
where vc.ID_VEHICULO_COMBUSTIBLE = ( 
   select top 1 x.id_VEHICULO_COMBUSTIBLE  from VEHICULO_COMBUSTIBLE as x where x.ID_VEHICULO = VEHICULO_COMBUSTIBLE.id_vehiculo and x.FECHA_REPOSTEO < VEHICULO_COMBUSTIBLE.FECHA_REPOSTEO
   order by x.FECHA_REPOSTEO desc)
          ), 0)
 as Kilometraje_lectura_anterior,
proveedor.descripcion as proveedor_desc, 
 vehiculo_combustible.factura,   
empleado.nombre as empleado_nombre,
empleado.apellido as empleado_apellido,
vehiculo_combustible.fecha_ins,   
vehiculo_combustible.fecha_mod,   
vehiculo_combustible.usuario_ins,   
vehiculo_combustible.usuario_mod ,

(select e.nombre + ' ' + e.apellido from empleado as e
where e.id_empleado = (
						select vh.id_empleado from VEHICULO_HISTORIAL as vh
						where vh.ID_VEHICULO_HISTORIAL = dbo.F_VEHICULO_CONDUCTOR_HISTORIAL (vehiculo_combustible.id_vehiculo , vehiculo_combustible.fecha_reposteo)
) ) as chofer,
vehiculo_marca.descripcion + ' ' + vehiculo_modelo.DESCRIPCION + 
case when convert(integer, convert(char(4), isnull(vehiculo_modelo.anio,{ts '1900-01-01 00:00:00.000'}), 121)) > 1950 then 
	' (' + convert(char(4), isnull(vehiculo_modelo.anio,{ts '1900-01-01 00:00:00.000'}), 121) + ')'
else '' end as vehiculo_modelo,
case vehiculo_combustible.TIPO_MOVIMIENTO when 'G' then 'Gasto'
when 'R' then 'Reembolsable'
when 'I' then 'Ingreso' else '(Desconocido)' end 
as tipo_movimiento_desc,
vehiculo_combustible.id_viaje ,
(select CENTRO_COSTO.DESCRIPCION 
from CENTRO_COSTO
where CENTRO_COSTO.ID_CENTRO_COSTO = VEHICULO.ID_CENTRO_COSTO) as centro_costo_actual, 
(select unidad_negocio.DESCRIPCION 
from unidad_negocio
where unidad_negocio.ID_unidad_negocio = VEHICULO.ID_unidad_negocio) as unidad_negocio_actual,


(select CENTRO_COSTO.DESCRIPCION from CENTRO_COSTO 
where CENTRO_COSTO.ID_CENTRO_COSTO = vehiculo_combustible.ID_CENTRO_COSTO) as veh_centro_costo_desc, 
(select unidad_negocio.DESCRIPCION from unidad_negocio 
where unidad_negocio.ID_unidad_negocio = vehiculo_combustible.ID_unidad_negocio) as veh_unidad_negocio_desc,
vehiculo_combustible.campo2,
vehiculo_combustible.campo3,
vehiculo.id_ciudad as vehiculo_id_sede,
case vehiculo_combustible.forma_pago when 'T' then 'Transferencia electrónica'
when 'D' then 'Depósito/consignación'
when 'C' then 'Cheque'
when 'E' then 'Efectivo'
when 'O' then 'Otros'
when 'A' then 'Tarjeta Terpel'
when 'B' then 'Chip Terpel' else '(Desconocido)' end
as forma_pago_desc

    FROM vehiculo, vehiculo_combustible left outer join proveedor on vehiculo_combustible.id_proveedor = proveedor.id_proveedor
left outer join empleado  on vehiculo_combustible.id_empleado = empleado.id_empleado,
 combustible_tipo, vehiculo_modelo, vehiculo_marca,
 (select min(usu_rel.ID_Usuario) as ID_Usuario from (select min(usuario.ID_USUARIO) as ID_Usuario from usuario, usuario_x_empleado 
	where ISNULL(${ID_Empleado},0) > 0 and usuario_x_empleado.id_empleado = ISNULL(${ID_Empleado},0)
   and usuario_x_empleado.id_usuario = usuario.id_usuario and usuario.activo = 1
	union all
	select 0 as ID_Usuario where isnull(${ID_Empleado},0) in (0, -1)
	) as usu_rel
        ) as usuario_rel left outer join usuario as usuarios on usuarios.id_usuario = usuario_rel.ID_Usuario

where vehiculo.id_vehiculo = vehiculo_combustible.id_vehiculo
and combustible_tipo.id_combustible_tipo = vehiculo_combustible.id_combustible_tipo
AND vehiculo_modelo.id_vehiculo_modelo = vehiculo.id_vehiculo_modelo   
AND vehiculo_marca.id_vehiculo_marca = vehiculo_modelo.id_vehiculo_marca 
and vehiculo.id_empresa_registro = ${ID_Empresa_Sesion}

and case isnull(usuarios.administrador, 1) when 1 then 0 else isnull(usuario_rel.ID_Usuario,0) end in (
	select USUARIO_X_EMPLEADO.ID_USUARIO from USUARIO, USUARIO_X_EMPLEADO
		where isnull(${ID_Empleado},0) > 0
		and vehiculo_combustible.ID_EMPLEADO = USUARIO_X_EMPLEADO.ID_EMPLEADO
		and USUARIO.ID_USUARIO = USUARIO_X_EMPLEADO.ID_USUARIO
		and USUARIO_X_EMPLEADO.ID_EMPLEADO = ${ID_Empleado}
		and USUARIO_X_EMPLEADO.id_empresa = ${ID_Empresa_Sesion}
		and usuarios.administrador = 0
	union all
	select ${ID_Empleado} from USUARIO, USUARIO_X_EMPLEADO
		where isnull(${ID_Empleado},0) > 0
		and vehiculo_combustible.USUARIO_INS = USUARIO.DESCRIPCION
		and USUARIO.ID_USUARIO = USUARIO_X_EMPLEADO.ID_USUARIO
		and USUARIO_X_EMPLEADO.ID_EMPLEADO = ${ID_Empleado}
		and USUARIO_X_EMPLEADO.id_empresa = ${ID_Empresa_Sesion}
		and usuarios.administrador = 0
	union all
	select 0 from TABLA_DUMMY where ${ID_Empleado} in (0, -1) or isnull(usuarios.administrador, 1) = 1
)


and (vehiculo.ID_ciudad is null or vehiculo.ID_ciudad in ( 
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


order by vehiculo_combustible.fecha_reposteo desc , 
vehiculo_combustible.id_vehiculo_combustible desc 
`;
    const result = await this.general(object, query);
    return result;
  }	 
}
