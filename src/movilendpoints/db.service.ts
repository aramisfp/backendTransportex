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
   const query = `select ID_Vehiculo, Identificador_Vehiculo, Identificador_Secundario, Marca, Modelo, Anio, Propietario, Afiliado_o_Propio, Tipo_de_Vehiculo, Uso_de_Vehiculo, Automotor, Conductor, Conductor_Secundario, Centro_de_Costo, Unidad_de_Negocio, Contrato, Sede, VIN, Serial_Motor, Estado, Kilometraje, Ultima_Fecha_Act_Kilometraje, Horas_de_Uso, Ultima_Fecha_Act_Horas, Remolques_Asignados, Tipo_de_Combustible, Empresa_Ambiente, ID_Empleado, ID_Empleado_2, ID_Tipo_de_Combustible 
    from dbo.V_BI_VEHICULOS,
	(select min(usu_rel.ID_Usuario) as ID_Usuario from (select min(usuario.ID_USUARIO) as ID_Usuario from usuario WITH (NOLOCK), usuario_x_empleado WITH (NOLOCK)
	where ${ID_Empleado} > 0 and usuario_x_empleado.id_empleado = ${ID_Empleado} 
   and usuario_x_empleado.id_usuario = usuario.id_usuario and usuario.activo = 1
	union all
	select 0 as ID_Usuario where isnull(${ID_Empleado},0) in (0, -1)
	) as usu_rel
        ) as usuario_rel
    where ${ID_Empresa_Sesion} in (ID_Empresa_Registro, 0)
and Estado = 'Activo'
and isnull(V_BI_VEHICULOS.ID_Sede,0) in ( 
select 0 union all
select esede.ID_SEDE 
from USUARIO_X_EMPLEADO as uxe WITH (NOLOCK), empleado as esede WITH (NOLOCK), USUARIO as usede WITH (NOLOCK), CONFIGURACION as config_filtro WITH (NOLOCK)
where config_filtro.CAMPO = 'VEH_EMPSEDE_FILTRO'
and config_filtro.VALOR = 'S'
and esede.ID_EMPLEADO = uxe.ID_EMPLEADO
and uxe.ID_EMPRESA = ${ID_Empresa_Sesion}
and uxe.ID_USUARIO = usede.ID_USUARIO
and uxe.ID_USUARIO = usuario_rel.ID_Usuario
union all
select emsede.ID_CIUDAD
from EMPRESA_SEDE as emsede WITH (NOLOCK), USUARIO as usede WITH (NOLOCK), CONFIGURACION as config_filtro WITH (NOLOCK)
where config_filtro.CAMPO = 'VEH_EMPSEDE_FILTRO'
and config_filtro.VALOR in ('N', case usede.ADMINISTRADOR when 1 then 'S' else CASE WHEN isnull(
	  (select esede.ID_SEDE from USUARIO_X_EMPLEADO as uxe WITH (NOLOCK), empleado as esede WITH (NOLOCK) where esede.ID_EMPLEADO = uxe.ID_EMPLEADO
		and uxe.ID_EMPRESA = emsede.ID_EMPRESA
		and uxe.ID_USUARIO = usede.ID_USUARIO
		), 0) = 0 THEN 'S' ELSE 'N' END end)
and emsede.ID_EMPRESA = ${ID_Empresa_Sesion}
and usuario_rel.ID_Usuario in (usede.ID_USUARIO,0)
union all
select emsede.ID_CIUDAD
from EMPRESA as emsede WITH (NOLOCK), USUARIO as usede WITH (NOLOCK), CONFIGURACION as config_filtro WITH (NOLOCK)
where config_filtro.CAMPO = 'VEH_EMPSEDE_FILTRO'
and config_filtro.VALOR in ('N', case usede.ADMINISTRADOR when 1 then 'S' else CASE WHEN isnull(
	  (select esede.ID_SEDE from USUARIO_X_EMPLEADO as uxe WITH (NOLOCK), empleado as esede WITH (NOLOCK) where esede.ID_EMPLEADO = uxe.ID_EMPLEADO
		and uxe.ID_EMPRESA = emsede.ID_EMPRESA
		and uxe.ID_USUARIO = usede.ID_USUARIO
		), 0) = 0 THEN 'S' ELSE 'N' END end)
and emsede.ID_EMPRESA = ${ID_Empresa_Sesion}
and usuario_rel.ID_Usuario in (usede.ID_USUARIO,0)
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
    '${usuario_mod}',
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
    const query = `select x.ID_Empleado, x.Nombre_Empleado, x.Codigo, x.Email, x.Cargo, x.Usuario, x.ID_Usuario 
from (
select ID_Empleado, Nombre_Empleado, Codigo, Email, Cargo, Usuario, ID_Usuario 
    from dbo.V_EMPLEADO 
    where ${ID_Empresa_Sesion} in (ID_Empresa_Registro, 0)
union all
select null as ID_Empleado, '(Ninguno)' as Nombre_Empleado, null as Codigo, null as Email, null as Cargo, null as Usuario, null as ID_Usuario 
) as x
order by case when x.ID_Empleado = ${ID_Empleado} or x.ID_Empleado is null then 0 else 1 end asc, 
x.Nombre_Empleado asc`;
    const result = await this.general(object, query);
    return result;
  }
  async novedades(object, ID_Empleado, todas, ID_Empresa_Sesion) {
    const query = `select ID_Actividad_Novedad, Vehiculo_Identificador_Primario, Empleado_Solicitud, Fecha_Solicitud, 
	Empleado_Asignacion, Fecha_Asignacion,  
 Descripcion, Actividad_Grupo, Estado, Estatus, Prioridad, Urgente, Referencia, 
 Fecha_Creacion, Usuario_Creacion, Usuario_Modificacion, 
 ID_Vehiculo, ID_Empleado_Solicitud, ID_Actividad_Grupo, 
 Archivos_Adjuntos_Cantidad, Vehiculo_Modelo 
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
    const query = `select id_archivo, nombre, fecha_ins, usuario_ins 
	from archivo WITH (NOLOCK) 
	where id_key_modulo = ${ID_Key} and modulo = '${Modulo_Letras}'
	union all
	select id_imagen as id_archivo, nombre, null as fecha_ins, null as usuario_ins 
	from imagen WITH (NOLOCK)
	where id_key_tabla = ${ID_Key} and tabla = '${Modulo_Letras}'
	order by 3 desc`;
    const result = await this.general(object, query);
    return result;
  }
  async repostajes(object, ID_Empleado, ID_Empresa_Sesion) {
   const query = `select id_vehiculo_combustible, id_vehiculo, id_proveedor, id_empleado, fecha_reposteo, Identificador_Vehiculo, cantidad_reposteo, 
   costo_unitario, id_combustible_tipo, combustible_tipo_desc, subtotal, monto_base, monto_iva, valor_iva, monto_descuento, kilometraje_lectura, horas_lectura, 
 proveedor_desc, factura, empleado_nombre, empleado_apellido, usuario_ins, usuario_mod,
chofer, vehiculo_modelo, tipo_movimiento, tipo_movimiento_desc, id_viaje, 
campo2,	campo3,	forma_pago, forma_pago_desc, archivos_adjuntos_cantidad, 
case convert(integer,config_showprint3p.VALOR) when 0 then 0 else 1 end as config_show3pformat
from dbo.F_SEL_VEHICULO_REPOSTAJE (${ID_Empleado}, ${ID_Empresa_Sesion}) as x, configuracion as config_showprint3p
where config_showprint3p.campo = 'IMPRESION_MOSTRAR_PDV'
order by fecha_reposteo desc , 
id_vehiculo_combustible desc`;
    const result = await this.general(object, query);
    return result;
  }	 

  async repostajestotal(object, ID_Empleado, ID_Empresa_Sesion) {
    const query = `select count(*) as TotalRepostajes
    from dbo.F_SEL_VEHICULO_REPOSTAJE(${ID_Empleado}, ${ID_Empresa_Sesion})`;
    const result = await this.general(object, query);
    return result;
  }	

  async proveedores(object, ID_Empresa_Sesion) {
    const query = `SELECT proveedor.id_proveedor,     
         proveedor.descripcion as proveedor_nombre,   
         proveedor.rif as identif_fiscal,
         proveedor.codigo 
    FROM proveedor WITH (NOLOCK)
   WHERE proveedor.activo = 1 and proveedor.SURTE_GASOLINA = 'S'
union all
select null as id_proveedor,     
'(Ninguno)' as proveedor_nombre,   
null as identif_fiscal,
null as codigo 
order by 2`;
    const result = await this.general(object, query);
    return result;
  }		

  async repostajegastotipo(object) {
    const query = `select 'Gasto' as gasto_naturaleza_desc, 'G' as valor 
    union all
    select 'Reembolsable' as gasto_naturaleza_desc, 'R' as valor`;
    const result = await this.general(object, query);
    return result;
  }		

  async repostajecombustibletipo(object) {
    const query = `SELECT combustible_tipo.id_combustible_tipo,
         combustible_tipo.descripcion as combustible_tipo_desc,
         combustible_tipo.precio_ref  
    FROM combustible_tipo WITH (NOLOCK)
    order by combustible_tipo.descripcion`;
    const result = await this.general(object, query);
    return result;
  }			

  async repostajeformapago(object) {
    const query = `select 'Transferencia electrónica' as tipogasto_desc, 'T' as valor union all
select 'Depósito/consignación' as tipogasto_desc, 'D' as valor union all
select 'Cheque' as tipogasto_desc, 'C' as valor union all
select 'Efectivo' as tipogasto_desc, 'E' as valor union all
select 'Prepagado' as tipogasto_desc, 'P' as valor from configuracion WITH (NOLOCK) where configuracion.CAMPO = 'CODIGO_EMPRESA' and 
configuracion.VALOR <> 'BANCONAL_PAN' and charindex(configuracion.VALOR, '_ARG') = 0 union all 
select 'Tarjeta' as tipogasto_desc, 'A' as valor from configuracion WITH (NOLOCK) where configuracion.CAMPO = 'CODIGO_EMPRESA' and 
(configuracion.VALOR = 'BANCONAL_PAN' or charindex(configuracion.VALOR, '_ARG') > 0) union all
select 'Chip' as tipogasto_desc, 'B' as valor from configuracion WITH (NOLOCK) where configuracion.CAMPO = 'CODIGO_EMPRESA' and configuracion.VALOR = 'BANCONAL_PAN' union all
select 'Otros' as tipogasto_desc, 'O' as valor`;
    const result = await this.general(object, query);
    return result;
  }	

  async repostajesconfig(object, ID_Empresa_Sesion) {
   const query = `SELECT case SUBSTRING(config_und.valor, 1, 1) when 'L' then 'Litros' else 'Galones' end   as config_medida_desc, 
case SUBSTRING(config_und.valor, 1, 1) when 'L' then 'L.' else 'gal.' end   as config_medida_abrev, 
config_campo2_mostrar.valor as config_campo2mostrar,
config_campo2_etiqueta.valor as config_campo2etiqueta,
config_campo3_mostrar.valor as config_campo3mostrar,
config_campo3_etiqueta.valor as config_campo3etiqueta,
config_campohoras_mostrar.valor as config_campohorasmostrar,
config_campoempleado_mostrar.valor as config_campoempleadomostrar,
config_campodcto_mostrar.valor as config_campodctomostrar,
config_campoidviaje_mostrar.valor as config_campoidviajemostrar,
convert(numeric(7,4), config_iva.VALOR) as config_IVAvalor,
config_ivaactivado.valor as config_IVAactivadodef
FROM CONFIGURACION as config_und WITH (NOLOCK), CONFIGURACION as config_dias WITH (NOLOCK),
		 CONFIGURACION as config_campo2_mostrar WITH (NOLOCK), CONFIGURACION as config_campo2_etiqueta WITH (NOLOCK),
		 CONFIGURACION as config_campo3_mostrar WITH (NOLOCK), CONFIGURACION as config_campo3_etiqueta WITH (NOLOCK),
		 CONFIGURACION as config_campohoras_mostrar WITH (NOLOCK), CONFIGURACION as config_campoempleado_mostrar WITH (NOLOCK),
		 CONFIGURACION as config_campodcto_mostrar WITH (NOLOCK), CONFIGURACION as config_campoidviaje_mostrar WITH (NOLOCK),
		 CONFIGURACION_X_EMPRESA as config_iva WITH (NOLOCK), CONFIGURACION as config_ivaactivado WITH (NOLOCK)
where config_und.CAMPO = 'VIAJE_MOSTRAR_KMSAUTONOMMEDIDA'
and config_dias.CAMPO = 'VEH_COMB_DIASANT_RETRIEVE'
and config_campo2_mostrar.CAMPO = 'VEH_COMB_CAMPO2_MOSTRAR'
and config_campo2_etiqueta.CAMPO = 'VEH_COMB_CAMPO2_ETIQUETA'
and config_campo3_mostrar.CAMPO = 'VEH_COMB_CAMPO3_MOSTRAR'
and config_campo3_etiqueta.CAMPO = 'VEH_COMB_CAMPO3_ETIQUETA'
and config_campohoras_mostrar.CAMPO = 'VIAJE_MOSTRAR_HORASDISTANCIA'
and config_campoempleado_mostrar.CAMPO = 'VEH_MOSTRAR_EMPLEADOCOMB'
and config_campodcto_mostrar.campo = 'VEH_COMB_CAMPODESC_MOSTRAR'
and config_campoidviaje_mostrar.campo = 'VEH_REPOSTGAS_IDVIAJE'
and config_ivaactivado.campo = 'VEH_COMBUSTIBLE_IVA_ACTIVADO'
and config_iva.CAMPO = 'IVA'
and config_iva.ID_EMPRESA = case when ${ID_Empresa_Sesion} = 0 then (select empresa.ID_EMPRESA from EMPRESA WITH (NOLOCK) where empresa.ACTUAL = 1 ) else ${ID_Empresa_Sesion} end`;
    const result = await this.general(object, query);
    return result;
  }	 

async repostajeinput(
    object,
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
  ) {
    const query = `Exec dbo.SP_UPD_SYNC_REPOSTAJE_COMBUSTIBLE 
    ${id_vehiculo_combustible}, 
${id_vehiculo},
${cantidad_reposteo},
${cantidad_reposteo_aut}, 
${cantidad_reposteo_enc},
${precio_unitario},
${valor_iva},
${monto_descuento},
${id_combustible_tipo},
'${tipo_movimiento}',
'${forma_pago}',
${fecha_reposteo},
${kilometraje_lectura},
${horas_lectura},
${id_proveedor},
${id_empleado},
${id_viaje},
'${factura}',
'${campo2}',
'${campo3}',
'${campo4}',
'${usuario}',
'${observaciones}'`;
    const result = await this.general(object, query);
    return result;
  }	
async repostajeimpresion(object, ID_Repostaje, ID_Usuario) {
    const query = `select x.id_vehiculo_combustible,  
x.etiqueta_copias,
x.empresa_principal,
x.empresa_principal_rif,
x.fecha_impresion,
x.usuario_impresion,
x.placa,
x.vehiculo_modelo, 
x.viaje_codigo_viaje +
case when x.guia_campo1 is null or ltrim(x.guia_campo1) = '' then '' else '    ' + x.etiqueta_guia_nombre + ': ' + x.viaje_guia_numero end as viaje_codigo_viaje, 
case when x.guia_campo1 is null or ltrim(x.guia_campo1) = '' then x.etiqueta_guia_nombre else x.etiqueta_campo1 end as etiqueta_campo1,
case when x.guia_campo1 is null or ltrim(x.guia_campo1) = '' then x.viaje_guia_numero else x.guia_campo1 end as guia_campo1,
case when  x.id_viaje is null  then '' else x.etiqueta_campo2 end as etiqueta_campo2,
x.guia_campo2,
x.usuario_ins,   
x.usuario_mod  ,
x.fecha_ins,   
x.fecha_mod,   
x.tipo_movimiento,
x.proveedor_desc, 
x.factura,   
x.fecha_reposteo,   
x.tipo_combustible,
x.und_volumen,
x.cantidad_reposteo_aut,   
x.cantidad_reposteo,   
x.costo_unitario,   
x.valor_iva,   
x.monto_iva,
x.costo_total,
x.empleado_nombre_apellido, 
x.kilometraje_lectura,   
x.horas_lectura
from 
(  SELECT vehiculo_combustible.id_vehiculo_combustible,  
	case when vehiculo_combustible.cantidad_impresion_micro <= 0 then 'O R I G I N A L' else
	'C O P I A   ' + rtrim(ltrim(STR(vehiculo_combustible.cantidad_impresion_micro))) end as etiqueta_copias,
	empresa_principal =  empresa.nombre ,
	empresa_principal_rif =  empresa.rif,
	dbo.F_GETDATE() as fecha_impresion,
	(select USUARIO.DESCRIPCION from USUARIO WITH (NOLOCK) where USUARIO.ID_USUARIO = ${ID_Usuario} ) as usuario_impresion,
	vehiculo.placa,
	vehiculo_marca.descripcion  + ' ' + 
	vehiculo_modelo.descripcion +  
	case when isnull(vehiculo_modelo.anio, {ts '1900-01-01 00:00:00.000'}) > {ts '1970-01-01 00:00:00.000'} then 
	' (' + convert(char(4), vehiculo_modelo.anio, 121) + ')'
	else ''
	end  as vehiculo_modelo,
	vehiculo_combustible.id_viaje,
	rtrim(ltrim(str(vehiculo_combustible.id_viaje) )) as viaje_codigo_viaje,
	case when  vehiculo_combustible.id_viaje is null  then '' else  etiqueta_guia.nombre end as  etiqueta_guia_nombre,
	case when viaje_guia.numero is null or ltrim(viaje_guia.numero) = ''  then  ''
	else viaje_guia.numero end  as viaje_guia_numero, 
	case when config_empresa.valor = 'TLI_SAL' then  config_etiq3.valor else config_etiq1.valor end + ':' 
	as etiqueta_campo1,
	case when config_empresa.valor = 'TLI_SAL' then  viaje_guia.campo_especial3 else viaje_guia.numero_relacion_gastos end as guia_campo1,
	case when config_empresa.valor = 'TLI_SAL' then  config_etiq4.valor else config_etiq2.valor end + ':' 
	as etiqueta_campo2,
	case when config_empresa.valor = 'TLI_SAL' then  viaje_guia.campo_especial4 else viaje_guia.factura_guia end as guia_campo2,
	vehiculo_combustible.usuario_ins,   
	vehiculo_combustible.usuario_mod,
	vehiculo_combustible.fecha_ins,   
	vehiculo_combustible.fecha_mod,   
	case vehiculo_combustible.TIPO_MOVIMIENTO when 'G' then 'Gasto' else 'Reembolsable' end as tipo_movimiento,
	proveedor.descripcion as proveedor_desc, 
	vehiculo_combustible.factura,
	vehiculo_combustible.fecha_reposteo,   
	COMBUSTIBLE_TIPO.DESCRIPCION as tipo_combustible,
	+  case when  substring(upper(config_undvol.valor), 1, 1) = 'L'  then 'Lts.' else  'gal.' end as und_volumen,
	vehiculo_combustible.cantidad_reposteo_aut,   
	vehiculo_combustible.cantidad_reposteo,   
	vehiculo_combustible.costo_unitario,   
	vehiculo_combustible.valor_iva,   
	vehiculo_combustible.monto_iva,
	(vehiculo_combustible.costo_unitario *  vehiculo_combustible.cantidad_reposteo ) + 
	(vehiculo_combustible.costo_unitario *  vehiculo_combustible.cantidad_reposteo *  (isnull(vehiculo_combustible.valor_iva,0) / 100))
	as costo_total,
	empleado.nombre + ' ' + empleado.apellido as empleado_nombre_apellido, 
	vehiculo_combustible.kilometraje_lectura,   
	vehiculo_combustible.horas_lectura
	FROM combustible_tipo WITH (NOLOCK), vehiculo_combustible WITH (NOLOCK) left outer join viaje_guia on viaje_guia.id_viaje = vehiculo_combustible.id_viaje and viaje_guia.principal = 1
	left outer join proveedor WITH (NOLOCK) on  vehiculo_combustible.id_proveedor = proveedor.id_proveedor
	left outer join empleado WITH (NOLOCK) on vehiculo_combustible.id_empleado = empleado.id_empleado 
	,empresa WITH (NOLOCK),vehiculo WITH (NOLOCK),vehiculo_modelo WITH (NOLOCK), vehiculo_marca WITH (NOLOCK), 
	configuracion as config_empresa WITH (NOLOCK), configuracion as config_etiq1 WITH (NOLOCK), configuracion as config_etiq2 WITH (NOLOCK), configuracion as config_etiq3 WITH (NOLOCK), configuracion as config_etiq4 WITH (NOLOCK),
	configuracion as config_undvol WITH (NOLOCK), (select dbo.F_ETIQUETA_GUIA(0,0) as nombre)  as etiqueta_guia
	WHERE vehiculo_combustible.id_vehiculo_combustible = ${ID_Repostaje} and
	vehiculo_combustible.id_vehiculo = vehiculo.id_vehiculo 
	and vehiculo_modelo.id_vehiculo_modelo = vehiculo.id_vehiculo_modelo
	and vehiculo_modelo.id_vehiculo_marca = vehiculo_marca.id_vehiculo_marca 
	and empresa.id_empresa = vehiculo.id_empresa_registro
	and config_empresa.campo = 'CODIGO_EMPRESA'
	and config_etiq1.campo = 'ETIQUETA_VIAJE_RELGASTOS'
	and config_etiq2.campo = 'ETIQUETA_VIAJE_FACTURAGUIA'
	and config_etiq3.campo = 'VIA_ETIQUETA_CAMPOESPECIAL3'
	and config_etiq4.campo = 'VIA_ETIQUETA_CAMPOESPECIAL4'
	and config_undvol.campo = 'VIAJE_MOSTRAR_KMSAUTONOMMEDIDA'
	and vehiculo_combustible.ID_COMBUSTIBLE_TIPO = COMBUSTIBLE_TIPO.ID_COMBUSTIBLE_TIPO
   ) as x`;
    const result = await this.general(object, query);
    return result;
  }
async repostajeimpresionsec(object, ID_Repostaje) {
    const query = `UPDATE dbo.VEHICULO_COMBUSTIBLE
    SET CANTIDAD_IMPRESION_MICRO = CANTIDAD_IMPRESION_MICRO + 1
    WHERE id_vehiculo_combustible = ${ID_Repostaje}`;
    const result = await this.general(object, query);
    return result;
  }	

  async neumaticosespesorpresion(object, ID_Vehiculo) {
   const query = `select id_neumatico, identificacion, validar_identificacion_neu, dot, 
   serial_fabricacion, serial_fabricacion_mostrar, semana_fabricacion, anio_fabricacion, 
   neumatico_modelo_descripcion,neumatico_diseno_descripcion, uso_descripcion, neumatico_carcasa_naturaleza,
fecha_adquisicion, kilometraje, espesor, fecha_act_espesor, ESPESOR_USUARIO_MOD,
ESPESOR_FECHA_MOD, espesor_observaciones, PRESION,FECHA_ACT_PRESION, PRESION_USUARIO_MOD,
PRESION_FECHA_MOD, presion_observaciones, fecha_reencauchado, REENCAUCHADO_VECES, fecha_instalacion, eje, posicion,  
POSICION_EJE_TEXTO, ubicacion_global_neu_desc, estatus, id_vehiculo, placa, vehiculo_modelo_descripcion, principal, tiene_tapon, ID_NEUMATICO_FALLA_TIPO,
presion_recomendada, presion_minima, presion_maxima, orden 
from dbo.F_SEL_NEUMATICO_ESPESORPRESION(${ID_Vehiculo}) as x
order by principal DESC, placa, orden`;
    const result = await this.general(object, query);
    return result;
  }	 
  async neumaticostipofallas(object) {
   const query = `select neumatico_falla_tipo.id_neumatico_falla_tipo,   
neumatico_falla_tipo.descripcion,   
neumatico_falla_tipo.desgaste_irregular 
from neumatico_falla_tipo  WITH (NOLOCK) 
where neumatico_falla_tipo.activo = 1 
union all
select null as id_neumatico_falla_tipo,   
'(Ninguna)' as descripcion,   
0 as desgaste_irregular 
order by 2`;
    const result = await this.general(object, query);
    return result;
  }	 

async neumaticosespesorpresioninput(
    object,
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
  ) {
    const query = `Exec dbo.SP_UPD_SYNC_NEUMATICO_ESPESORPRESION 
${id_neumatico}, NULL, 
${espesor},
${espesor_fecha_act},
'${espesor_observaciones}', 
${presion},
${presion_fecha_act},
'${presion_observaciones}',
${tiene_tapon},
${id_neumatico_falla_tipo},
'${usuario}', NULL`;
    const result = await this.general(object, query);
    return result;
  }	


async neumaticosespesorpresionerrorinput(
    object,
id_neumatico, 
identificacion_escrita,
espesor,
espesor_observaciones, 
presion,
presion_observaciones,
tiene_tapon,
id_neumatico_falla_tipo,
usuario,
  ) {
    const query = `Exec dbo.SP_UPD_SYNC_NEUMATICO_REG_POS 
${id_neumatico}, 
'${identificacion_escrita}', 
${espesor},
'${espesor_observaciones}', 
${presion},
'${presion_observaciones}',
${tiene_tapon},
${id_neumatico_falla_tipo},
'${usuario}'`;
    const result = await this.general(object, query);
    return result;
  }	




  async appbdversion(object) {
   const query = `select isnull((select convert(integer, CONFIGURACION.valor)  
from CONFIGURACION  WITH (NOLOCK)
where campo = 'SVER_ACT'),2) as version_en_uso`;
    const result = await this.general(object, query);
    return result;
  }	 

  async appbdmodulos(object) {
   const query = `select dbo.F_PROGMODULES() as modulos_en_uso`;
    const result = await this.general(object, query);
    return result;
  }		
	
}
