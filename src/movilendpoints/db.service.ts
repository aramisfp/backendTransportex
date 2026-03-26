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
      "select Nombre, ID_Empresa from dbo.V_BI_EMPRESAS where substring(Multiempresa,1,1) = 'S' and substring(Activa,1,1) = 'S' order by Nombre";
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
  async vehiculos(object, ID_Empleado, ID_Empresa_Sesion, Tipo_Carroceria) {

    let tipo_carroceria_filter = Tipo_Carroceria ?? 'T';

   const query = `select ID_Vehiculo, Identificador_Vehiculo, Identificador_Secundario, Marca, Modelo, Anio, Afiliado_o_Propio, Automotor, Conductor, Kilometraje, Ultima_Fecha_Act_Kilometraje, Horas_de_Uso, Ultima_Fecha_Act_Horas, Tipo_de_Combustible, ID_Empleado, ID_Empleado_2, ID_Tipo_de_Combustible 
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
and ('${tipo_carroceria_filter}' = 'T' or '${tipo_carroceria_filter}' in  (case when substring(automotor, 1, 1) = 'S' then 'C' else 'R' end))
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
case substring(upper(V_BI_VEHICULOS.Automotor), 1, 1) when 'S' then 1 else 9 end,
case when ISNUMERIC(V_BI_VEHICULOS.Identificador_Vehiculo) = 1 then convert(numeric, V_BI_VEHICULOS.Identificador_Vehiculo) else 99999999 end,
V_BI_VEHICULOS.Identificador_Vehiculo`;
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
    const query = `select x.ID_Empleado, x.Nombre_Empleado, x.Usuario, x.ID_Usuario 
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
  async archivoUpdate(object, id_archivo, nuevoContenido, Modulo_Letras) {
    let query = '';
    if(Modulo_Letras === null || Modulo_Letras === undefined || Modulo_Letras.length <= 3) {
      query = `
        UPDATE dbo.ARCHIVO
        SET CONTENIDO =  0x${nuevoContenido.toString('hex')}
        WHERE id_archivo = ${id_archivo}
      `;
    } else {
      query = `
        UPDATE dbo.IMAGEN
        SET CONTENIDO =  0x${nuevoContenido.toString('hex')}
        WHERE id_imagen = ${id_archivo}
      `;
    }
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
kilometraje, fecha_ult_inspeccion, espesor, fecha_act_espesor, ESPESOR_USUARIO_MOD,
ESPESOR_FECHA_MOD, espesor_observaciones, PRESION,FECHA_ACT_PRESION, PRESION_USUARIO_MOD,
PRESION_FECHA_MOD, presion_observaciones, fecha_reencauchado, REENCAUCHADO_VECES, fecha_instalacion,   
POSICION_EJE_TEXTO, EJE, POSICION, ubicacion_global_neu_desc, estatus, id_vehiculo, placa, vehiculo_modelo_descripcion, principal, 
tiene_tapon, ID_NEUMATICO_FALLA_TIPO, presion_recomendada, presion_minima, presion_maxima, orden 
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


  async documentosvencidos(object, ID_Empleado) {
   const query = `select 
x.aplica_documento, 
x.modulo_documento,
x.tipo_documento,
x.numero_documento, 
x.fecha_vencimiento, 
x.estado_documento,
x.requerido,
x.matricula_vehiculo_etiqueta,
x.matricula_vehiculo,
x.identif_sec_vehiculo_etiqueta,
x.identif_sec_vehiculo,
x.nombre_empleado,
case x.modulo_documento 
when 'DOC' then x.id_empleado
when 'DOV' then x.id_vehiculo else x.id_empresa end as id_elemento,
x.id_tipo_documento
from dbo.F_SEL_ALARMA_DOCUMENTOS ('V') as x
where x.id_empleado = ${ID_Empleado}
and x.modulo_documento = 'DOC'
order by x.aplica_documento, 
case x.estado when 'V' then 2 when 'P' then 3 else 1 end,
x.requerido desc, x.fecha_vencimiento,  
x.tipo_documento`;
    const result = await this.general(object, query);
    return result;
  }	 

async documentosvencidosinput(
    object,
naturaleza,
id_elemento, 
id_tipo_documento,
numero,
fecha_emision, 
fecha_documento,
costo_tramite,
observaciones,
usuario,
  ) {
    const query = `Exec dbo.SP_INS_SYNC_DOCUMENTO 
'${naturaleza}', 
${id_elemento}, 
${id_tipo_documento},
'${numero}', 
'${fecha_emision}', 
'${fecha_documento}', 
${costo_tramite},
'${observaciones}',
'${usuario}'`;
    const result = await this.general(object, query);
    return result;
  }	



  async viajelistado(object, ID_Empleado) {
   const query = `select id_viaje,	id_vehiculo, placa_etiqueta,	placa, vehidsec_etiqueta, identificacion as veh_identificacion,
   conductor_etiqueta, conductor,	conductor_2,	
guia_numero_etiqueta,	guia_numero,	
guia_campo1_etiqueta, guia_campo1_mostrar,	guia_campo1,	
guia_campo2_etiqueta,	guia_campo2_mostrar	, guia_campo2,
guia_campo3_etiqueta,	guia_campo3_mostrar,	guia_campo3,
guia_campo4_etiqueta,	guia_campo4_mostrar,	guia_campo4,
cliente,	trayecto,	fecha_salida,	camion_etiqueta, remolques_asociados_etiqueta, remolques_asociados,
tipo_carga_descripcion,	carga_tipo_embarque, 
id_viaje_solicitud,	carta_oferta_desc
from dbo.F_SEL_VIAJE_EMPLEADO(${ID_Empleado}) as x
order by x.fecha_salida, x.id_viaje desc`;
    const result = await this.general(object, query);
    return result;
  }	 

  async viajedetalles(object, ID_Viaje) {
   const query = `select   id_viaje,	id_viaje_guia,	id_vehiculo,id_empleado,	fecha_salida,	fecha_llegada,	guia_etiqueta, 
  guia_numero_etiqueta, 
numero_guia,
guia_campo1_etiqueta, 
 guia_campo1_mostrar,
 guia_campo1,
 guia_campo2_etiqueta,
 guia_campo2_mostrar,
guia_campo2,
guia_campo3_etiqueta,
 guia_campo3_mostrar,
guia_campo3,
 guia_campo4_etiqueta,
 guia_campo4_mostrar,  
guia_campo4,
principal,
cliente, 	cliente_despacho, ciudad_origen,	ciudad_destino,	
placa_etiqueta, placa, vehidsec_etiqueta, identificacion as veh_identificacion,	vehiculo_modelo, total_ejes_camion,
camion_etiqueta, remolques_asociados_etiqueta,  cavas_asociadas, total_ejes_remolque, 
cargo_conductor, conductor,	cedula_etiqueta,  cedula,	estibador,
total_adelantos, empleado_sueldo_base,	estadia	sueldo_estadia,
viaje_observaciones, carga_tipo, carga_peso,	carga_peso_medida,	
empresa_principal,	empresa_principal_rif,	ciudad_actual as empresa_principal_ciudad
from dbo.F_SEL_VIAJE_ORDEN(${ID_Viaje},0) as x
order by x.numero_guia, x.id_viaje_guia`;
    const result = await this.general(object, query);
    return result;
  }	 


async viajepermisoentsal(
    object,
id_viaje,
id_empleado,
  ) {
    const query = `Exec dbo.SP_USUARIO_PERMISO_VIAJE_ES 
${id_viaje}, 
${id_empleado}`;
    const result = await this.general(object, query);
    return result;
  }	



async viajeentradasalidainput(
    object,
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
  ) {
    const query = `Exec dbo.SP_UPD_SYNC_VIAJE_ENTRADASALIDA 
${id_viaje}, 
NULL,
'${tipo}', 
'${observaciones}', 
'${latitud}', 
'${longitud}', 
'${computador}',
'${usuario}',
'${latitud_escaneador}', 
'${longitud_escaneador}', 
'${estado_gps_conductor}', 
'${estado_gps_escaneador}', 
${metros_distancia_escaneo}`;
    const result = await this.general(object, query);
    return result;
  }	


  async viajesolnueva(object) {
   const query = `select   case  campo_grupo  when 1 then 'Campos de la solicitud' when 2 then 'Campos del encabezado' when 3 then 'Campos adicionales ' + dbo.f_etiqueta_guia(0,0) + ' principal' when 4 then 'Campos de datos de carga' else 'Campos desconocidos' end as grupo_descripion,
viaje_sol_campo.descripcion_campo,   
viaje_sol_campo.campo_layout,
viaje_sol_campo.campo_grupo,   
viaje_sol_campo.campo_orden,   
viaje_sol_campo.activo,   
viaje_sol_campo.obligatorio 
from viaje_sol_campo   
order by viaje_sol_campo.campo_grupo, viaje_sol_campo.campo_orden`;
    const result = await this.general(object, query);
    return result;
  }	

  async viajesoledit(object, ID_Viaje_Solicitud) {
   const query = `select viaje_solicitud.id_viaje_solicitud,   
viaje_solicitud.id_empleado,  solcampo_id_empleado.activo as solcampo_id_empleado_act,   solcampo_id_empleado.campo_orden as solcampo_id_empleado_ord,  solcampo_id_empleado.obligatorio as solcampo_id_empleado_obl,        
viaje_solicitud.id_ciudad_origen,  solcampo_id_ciudad_origen.activo as solcampo_id_ciudad_origen_act, solcampo_id_ciudad_origen.campo_orden as solcampo_id_ciudad_origen_ord,  solcampo_id_ciudad_origen.obligatorio as solcampo_id_ciudad_origen_obl,         
viaje_solicitud.id_ciudad_destino,  solcampo_id_ciudad_destino.activo as solcampo_id_ciudad_destino_act,    solcampo_id_ciudad_destino.campo_orden as solcampo_id_ciudad_destino_ord,     solcampo_id_ciudad_destino.obligatorio as solcampo_id_ciudad_destino_obl,   
viaje_solicitud.id_vehiculo_uso,    solcampo_id_vehiculo_uso.activo as solcampo_id_vehiculo_uso_act, solcampo_id_vehiculo_uso.campo_orden as solcampo_id_vehiculo_uso_ord,   solcampo_id_vehiculo_uso.obligatorio as solcampo_id_vehiculo_uso_obl,   
viaje_solicitud.id_vehiculo_uso_cava,     solcampo_id_vehiculo_uso_cava.activo as solcampo_id_vehiculo_uso_cava_act,  solcampo_id_vehiculo_uso_cava.campo_orden as solcampo_id_vehiculo_uso_cava_ord,  solcampo_id_vehiculo_uso_cava.obligatorio as solcampo_id_vehiculo_uso_cava_obl,      
viaje_solicitud.id_vehiculo_tipo, solcampo_id_vehiculo_tipo.activo as solcampo_id_vehiculo_tipo_act,  solcampo_id_vehiculo_tipo.campo_orden as solcampo_id_vehiculo_tipo_ord,   solcampo_id_vehiculo_tipo.obligatorio as solcampo_id_vehiculo_tipo_obl,      
viaje_solicitud.id_vehiculo_tipo_cava,    solcampo_id_vehiculo_tipo_cava.activo as solcampo_id_vehiculo_tipo_cava_act,  solcampo_id_vehiculo_tipo_cava.campo_orden as solcampo_id_vehiculo_tipo_cava_ord,  solcampo_id_vehiculo_tipo_cava.obligatorio as solcampo_id_vehiculo_tipo_cava_obl,   
viaje_solicitud.id_empresa,    solcampo_id_empresa.activo as solcampo_numero_id_empresa_act,  solcampo_id_empresa.campo_orden as solcampo_numero_id_empresa_ord, solcampo_id_empresa.obligatorio as solcampo_numero_id_empresa_obl,      
viaje_solicitud.id_empresa_despacho,   solcampo_id_empresa_despacho.activo as solcampo_numero_id_empresa_despacho_act,    solcampo_id_empresa_despacho.campo_orden as solcampo_numero_id_empresa_despacho_ord,  solcampo_id_empresa_despacho.obligatorio as solcampo_numero_id_empresa_despacho_obl,     
viaje_solicitud.id_viaje_carga_tipo,  solcampo_id_viaje_carga_tipo.activo as solcampo_id_viaje_carga_tipo_act,   solcampo_id_viaje_carga_tipo.campo_orden as solcampo_id_viaje_carga_tipo_ord,  solcampo_id_viaje_carga_tipo.obligatorio as solcampo_id_viaje_carga_tipo_obl,    
viaje_solicitud.id_medida_pieza, solcampo_id_medida_pieza.activo as solcampo_id_medida_pieza_act,  solcampo_id_medida_pieza.campo_orden as solcampo_id_medida_pieza_ord,   solcampo_id_medida_pieza.obligatorio as solcampo_id_medida_pieza_obl,        
viaje_solicitud.fecha_solicitud,  solcampo_fecha_solicitud.activo as solcampo_fecha_solicitud_act,  solcampo_fecha_solicitud.campo_orden as solcampo_fecha_solicitud_ord,   solcampo_fecha_solicitud.obligatorio as solcampo_fecha_solicitud_obl,   
viaje_solicitud.fecha_salida,    solcampo_fecha_salida.activo as solcampo_fecha_salida_act,    solcampo_fecha_salida.campo_orden as solcampo_fecha_salida_ord,   solcampo_fecha_salida.obligatorio as solcampo_fecha_salida_obl, 
viaje_solicitud.fecha_salida_estimada,  solcampo_fecha_salida_estimada.activo as solcampo_fecha_salida_estimada_act,  solcampo_fecha_salida_estimada.campo_orden as solcampo_fecha_salida_estimada_ord,  solcampo_fecha_salida_estimada.obligatorio as solcampo_fecha_salida_estimada_obl,      

empleado.nombre + ' ' + empleado.apellido as id_empleado_descripcion,
c1.descripcion as id_ciudad_origen_descripcion, 
c2.descripcion as id_ciudad_destino_descripcion, 

vucamion.descripcion as id_vehiculo_uso_descripcion,
vuremolque.descripcion as id_vehiculo_uso_cava_descripcion,
vtcamion.descripcion as id_vehiculo_tipo_descripcion,
vtremolque.descripcion as id_vehiculo_tipo_cava_descripcion,
edespacho.nombre as id_empresa_despacho_descripcion,
cliente.nombre as id_empresa_descripcion,
viaje_carga_tipo.descripcion  as id_viaje_carga_tipo_descripcion, 
medida_pieza.descripcion as id_medida_pieza_descripcion, 

viaje_solicitud.factura_flete  , solcampo_factura_flete.activo as solcampo_factura_flete_act, solcampo_factura_flete.campo_orden as solcampo_factura_flete_ord,  solcampo_factura_flete.obligatorio as solcampo_factura_flete_obl,  
viaje_solicitud.barco_nro_viaje ,  solcampo_barco_nro_viaje.activo as solcampo_barco_nro_viaje_act,  solcampo_barco_nro_viaje.campo_orden as solcampo_barco_nro_viaje_ord,  solcampo_barco_nro_viaje.obligatorio as solcampo_barco_nro_viaje_obl,  
viaje_solicitud.barco_nombre   ,  solcampo_barco_nombre.activo as solcampo_barco_nombre_act, solcampo_barco_nombre.campo_orden as solcampo_barco_nombre_ord,  solcampo_barco_nombre.obligatorio as solcampo_barco_nombre_obl,   
viaje_solicitud.carga_cargado    ,  solcampo_carga_cargado.activo as solcampo_carga_cargado_act, solcampo_barco_nombre.campo_orden as solcampo_barco_nombre_ord,  solcampo_barco_nombre.obligatorio as solcampo_barco_nombre_obl, 
viaje_solicitud.fecha_llegada_estimada,  solcampo_fecha_llegada_estimada.activo as solcampo_fecha_llegada_estimada_act,  solcampo_fecha_llegada_estimada.campo_orden as solcampo_fecha_llegada_estimada_ord,  solcampo_fecha_llegada_estimada.obligatorio as solcampo_fecha_llegada_estimada_obl,   
viaje_solicitud.fecha_factura_flete, solcampo_fecha_factura_flete.activo as solcampo_fecha_factura_flete_act,  solcampo_fecha_factura_flete.campo_orden as solcampo_fecha_factura_flete_ord,  solcampo_fecha_factura_flete.campo_orden as solcampo_fecha_factura_flete_obl,  
viaje_solicitud.fecha_factura_afiliado,
viaje_solicitud.monto_flete_cotizado,  solcampo_monto_flete_cotizado.activo as solcampo_monto_flete_cotizado_act,  solcampo_monto_flete_cotizado.campo_orden as solcampo_monto_flete_cotizado_ord,  solcampo_monto_flete_cotizado.obligatorio as solcampo_monto_flete_cotizado_obl,   

viaje_solicitud.guia_numero,   solcampo_guia_numero.activo as solcampo_guia_numero_act, solcampo_guia_numero.campo_orden as solcampo_guia_numero_ord,  solcampo_guia_numero.obligatorio as solcampo_guia_numero_obl,    
viaje_solicitud.numero_relacion_gastos,    solcampo_numero_relacion_gastos.activo as solcampo_numero_relacion_gastos_act,  solcampo_numero_relacion_gastos.campo_orden as solcampo_numero_relacion_gastos_ord,  solcampo_numero_relacion_gastos.obligatorio as solcampo_numero_relacion_gastos_obl,     
viaje_solicitud.factura_guia,    solcampo_factura_guia.activo as solcampo_numero_factura_guia_act,   solcampo_factura_guia.campo_orden as solcampo_numero_factura_guia_ord,     solcampo_factura_guia.obligatorio as solcampo_numero_factura_guia_obl,  
viaje_solicitud.campo_especial3,    solcampo_campo_especial3.activo as solcampo_numero_campo_especial3_act,  solcampo_campo_especial3.campo_orden as solcampo_numero_campo_especial3_ord,  solcampo_campo_especial3.obligatorio as solcampo_numero_campo_especial3_obl,   
viaje_solicitud.campo_especial4,   solcampo_campo_especial4.activo as solcampo_numero_campo_especial4_act,   solcampo_campo_especial4.campo_orden as solcampo_numero_campo_especial4_ord,  solcampo_campo_especial4.obligatorio as solcampo_numero_campo_especial4_obl,   
viaje_solicitud.descripcion,   solcampo_descripcion.activo as solcampo_descripcion_act,  solcampo_descripcion.campo_orden as solcampo_descripcion_ord,   solcampo_descripcion.obligatorio as solcampo_descripcion_obl, 
viaje_solicitud.fecha_embarque,   solcampo_fecha_embarque.activo as solcampo_fecha_embarque_act,  solcampo_fecha_embarque.campo_orden as solcampo_fecha_embarque_ord,  solcampo_fecha_embarque.obligatorio as solcampo_fecha_embarque_obl,  
viaje_solicitud.pieza_cantidad,  solcampo_pieza_cantidad.activo as solcampo_pieza_cantidad_act,  solcampo_pieza_cantidad.campo_orden as solcampo_pieza_cantidad_ord,  solcampo_pieza_cantidad.obligatorio as solcampo_pieza_cantidad_obl,       
viaje_solicitud.peso,   solcampo_peso.activo as solcampo_peso_act,  solcampo_peso.campo_orden as solcampo_peso_ord,  solcampo_peso.obligatorio as solcampo_peso_obl,    
viaje_solicitud.peso_medida,    solcampo_peso_medida.activo as solcampo_peso_medida_act,  solcampo_peso_medida.campo_orden as solcampo_peso_medida_ord,  solcampo_peso_medida.obligatorio as solcampo_peso_medida_obl,     
case viaje_solicitud.peso_medida when 'k' then 'kg.' else 't.' end  as peso_medida_descripcion, 
viaje_solicitud.pasajeros,    solcampo_pasajeros.activo as solcampo_pasajeros_act,  solcampo_pasajeros.campo_orden as solcampo_pasajeros_ord,  solcampo_pasajeros.obligatorio as solcampo_pasajeros_obl,  
viaje_solicitud.largo,     solcampo_largo.activo as solcampo_largo_act,  solcampo_largo.campo_orden as solcampo_largo_ord,   solcampo_largo.obligatorio as solcampo_largo_obl,  
viaje_solicitud.ancho,    solcampo_ancho.activo as solcampo_ancho_act,  solcampo_ancho.campo_orden as solcampo_ancho_ord, solcampo_largo.obligatorio as solcampo_largo_obl, 
viaje_solicitud.alto,    solcampo_alto.activo as solcampo_alto_act,  solcampo_alto.campo_orden as solcampo_alto_ord,  solcampo_alto.obligatorio as solcampo_alto_obl,  
viaje_solicitud.longitud_medida,     solcampo_longitud_medida.activo as solcampo_longitud_medida_act,  solcampo_longitud_medida.campo_orden as solcampo_longitud_medida_ord,   solcampo_longitud_medida.obligatorio as solcampo_longitud_medida_obl,   
case viaje_solicitud.longitud_medida when 'c' then 'cm.' else 'm.' end  as longitud_medida_descripcion,
		 
viaje_solicitud.volumen,    solcampo_volumen.activo as solcampo_volumen_act,  solcampo_volumen.campo_orden as solcampo_volumen_ord,   solcampo_volumen.obligatorio as solcampo_volumen_obl, 
viaje_solicitud.volumen_medida,    solcampo_volumen_medida.activo as solcampo_volumen_medida_act,  solcampo_volumen_medida.campo_orden as solcampo_volumen_medida_ord,  solcampo_volumen_medida.obligatorio as solcampo_volumen_medida_obl,    
case viaje_solicitud.volumen_medida when 'l' then 'lts.' when 'g' then 'gal.' when 'm' then 'm³' when 's' then 'ms' when 'p' then 'ft³' end as volumen_medida_descripcion, 
viaje_solicitud.repartos_internos,   solcampo_repartos_internos.activo as solcampo_repartos_internos_act,  solcampo_repartos_internos.campo_orden as solcampo_repartos_internos_ord,  solcampo_repartos_internos.obligatorio as solcampo_repartos_internos_obl,
viaje_solicitud.repartos_externos,    solcampo_repartos_externos.activo as solcampo_repartos_externos_act, solcampo_repartos_externos.campo_orden as solcampo_repartos_externos_ord,  solcampo_repartos_externos.obligatorio as solcampo_repartos_externos_obl,   
viaje_solicitud.observaciones,  solcampo_observaciones.activo as solcampo_observaciones_act, solcampo_observaciones.campo_orden as solcampo_observaciones_ord, solcampo_observaciones.obligatorio as solcampo_observaciones_obl,  
viaje_solicitud.tipo_origen,  solcampo_tipo_origen.activo as solcampo_tipo_origen_act,   solcampo_tipo_origen.campo_orden as solcampo_tipo_origen_ord,   solcampo_tipo_origen.obligatorio as solcampo_tipo_origen_obl,     
case viaje_solicitud.tipo_origen when 'i' then 'importación' when 'e' then 'exportación' when 'r' then 'retorno' when 'c' then 'carrusel impo full' when 'm' then 'carrusel impo empty' when 'p' then 'carrusel expo full' when 't' then 'carrusel expo empty' else 'nacional' end  as tipo_origen_descripcion,

viaje_solicitud.fecha_llegada, solcampo_fecha_llegada.activo as solcampo_fecha_llegada_act, solcampo_fecha_llegada.campo_orden as solcampo_fecha_llegada_ord,  solcampo_fecha_llegada.obligatorio as solcampo_fecha_llegada_obl, 
viaje_solicitud.fecha_entrega, solcampo_fecha_entrega.activo as solcampo_fecha_entrega_act, solcampo_fecha_entrega.campo_orden as solcampo_fecha_entrega_ord, solcampo_fecha_entrega.obligatorio as solcampo_fecha_entrega_obl,   
viaje_solicitud.custodia,  solcampo_custodia.activo as solcampo_custodia_act, solcampo_custodia.campo_orden as solcampo_custodia_ord, solcampo_custodia.obligatorio as solcampo_custodia_obl,  
viaje_solicitud.marchamo,  solcampo_marchamo.activo as solcampo_marchamo_act, solcampo_marchamo.campo_orden as solcampo_marchamo_ord, solcampo_marchamo.obligatorio as solcampo_marchamo_obl,  
viaje_solicitud.marchamo_serial,   solcampo_marchamo_serial.activo as solcampo_marchamo_serial_act,  solcampo_marchamo_serial.campo_orden as solcampo_marchamo_serial_ord, solcampo_marchamo_serial.obligatorio as solcampo_marchamo_serial_obl, 
viaje_solicitud.observaciones_viaje ,   solcampo_observaciones_viaje.activo as solcampo_observaciones_viaje_act,  solcampo_observaciones_viaje.campo_orden as solcampo_observaciones_viaje_ord,  solcampo_observaciones_viaje.obligatorio as solcampo_observaciones_viaje_obl,


viaje_solicitud.fecha_ins, 
viaje_solicitud.fecha_mod,  
viaje_solicitud.usuario_ins,
viaje_solicitud.usuario_mod, 
viaje_solicitud.id_empresa_registro,
v_viaje_solicitud.id_viaje,
viaje_solicitud.solicitud_referencia,  solcampo_solicitud_referencia.activo as solcampo_solicitud_referencia_act,  solcampo_solicitud_referencia.campo_orden as solcampo_solicitud_referencia_ord,   solcampo_solicitud_referencia.obligatorio as solcampo_solicitud_referencia_obl,    

v_viaje_solicitud.sede_empleado_solicitud,
v_viaje_solicitud.sede_usuario_ins,
viaje_solicitud.carga_peligrosa,  solcampo_carga_peligrosa.activo as solcampo_carga_peligrosa_act,  solcampo_carga_peligrosa.campo_orden as solcampo_carga_peligrosa_ord,  solcampo_carga_peligrosa.obligatorio as solcampo_carga_peligrosa_obl  
 

FROM V_VIAJE_SOLICITUD, VIAJE_SOLICITUD  WITH (NOLOCK) left outer join empleado WITH (NOLOCK) on VIAJE_SOLICITUD.id_empleado = empleado.id_empleado  
left outer join ciudad as c1 WITH (NOLOCK) on  VIAJE_SOLICITUD.ID_CIUDAD_ORIGEN = c1.id_ciudad  
left outer join ciudad as c2 WITH (NOLOCK) on  VIAJE_SOLICITUD.ID_CIUDAD_DESTINO = c2.id_ciudad  
left outer join vehiculo_uso as vucamion on VIAJE_SOLICITUD.ID_VEHICULO_USO = vucamion.ID_VEHICULO_USO
left outer join vehiculo_uso as vuremolque on VIAJE_SOLICITUD.ID_VEHICULO_USO = vuremolque.ID_VEHICULO_USO
left outer join vehiculo_tipo as vtcamion on VIAJE_SOLICITUD.ID_VEHICULO_TIPO = vtcamion.ID_VEHICULO_TIPO
left outer join vehiculo_tipo as vtremolque on VIAJE_SOLICITUD.ID_VEHICULO_TIPO = vtremolque.ID_VEHICULO_TIPO
left outer join empresa as edespacho on VIAJE_SOLICITUD.id_empresa_despacho = edespacho.id_empresa 
left outer join empresa as cliente on VIAJE_SOLICITUD.id_empresa = cliente.id_empresa
left outer join viaje_carga_tipo  on VIAJE_SOLICITUD.id_viaje_carga_tipo = viaje_carga_tipo.id_viaje_carga_tipo
left outer join MEDIDA_PIEZA  on VIAJE_SOLICITUD.id_medida_pieza = MEDIDA_PIEZA.id_medida_pieza,

(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'fecha_solicitud') as solcampo_fecha_solicitud,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'id_empleado') as solcampo_id_empleado,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'solicitud_referencia') as solcampo_solicitud_referencia,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'id_ciudad_origen') as solcampo_id_ciudad_origen,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'id_ciudad_destino') as solcampo_id_ciudad_destino,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'id_vehiculo_uso') as solcampo_id_vehiculo_uso,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'id_vehiculo_uso_cava') as solcampo_id_vehiculo_uso_cava,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'id_vehiculo_tipo') as solcampo_id_vehiculo_tipo,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'id_vehiculo_tipo_cava') as solcampo_id_vehiculo_tipo_cava,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'fecha_salida_estimada') as solcampo_fecha_salida_estimada,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'fecha_salida') as solcampo_fecha_salida,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'fecha_llegada_estimada') as solcampo_fecha_llegada_estimada,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'fecha_llegada') as solcampo_fecha_llegada,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'observaciones_viaje') as solcampo_observaciones_viaje,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'guia_numero') as solcampo_guia_numero,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'numero_relacion_gastos') as solcampo_numero_relacion_gastos,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'factura_guia') as solcampo_factura_guia,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'campo_especial3') as solcampo_campo_especial3,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'campo_especial4') as solcampo_campo_especial4,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'id_empresa_despacho') as solcampo_id_empresa_despacho,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'id_empresa') as solcampo_id_empresa,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'fecha_entrega') as solcampo_fecha_entrega,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'factura_flete') as solcampo_factura_flete,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'fecha_factura_flete') as solcampo_fecha_factura_flete,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'monto_flete_cotizado') as solcampo_monto_flete_cotizado,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'id_viaje_carga_tipo') as solcampo_id_viaje_carga_tipo,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'tipo_origen') as solcampo_tipo_origen,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'carga_peligrosa') as solcampo_carga_peligrosa,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'descripcion') as solcampo_descripcion,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'fecha_embarque') as solcampo_fecha_embarque,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'pieza_cantidad') as solcampo_pieza_cantidad,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'id_medida_pieza') as solcampo_id_medida_pieza,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'peso') as solcampo_peso,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'peso_medida') as solcampo_peso_medida,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'pasajeros') as solcampo_pasajeros,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'largo') as solcampo_largo,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'ancho') as solcampo_ancho,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'alto') as solcampo_alto,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'longitud_medida') as solcampo_longitud_medida,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'volumen') as solcampo_volumen,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'volumen_medida') as solcampo_volumen_medida,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'repartos_internos') as solcampo_repartos_internos,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'repartos_externos') as solcampo_repartos_externos,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'barco_nro_viaje') as solcampo_barco_nro_viaje,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'barco_nombre') as solcampo_barco_nombre,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'carga_cargado') as solcampo_carga_cargado,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'custodia') as solcampo_custodia,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'marchamo') as solcampo_marchamo,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'marchamo_serial') as solcampo_marchamo_serial,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'observaciones') as solcampo_observaciones

where VIAJE_SOLICITUD.id_VIAJE_SOLICITUD = ${ID_Viaje_Solicitud} 
and V_VIAJE_SOLICITUD.id_VIAJE_SOLICITUD = VIAJE_SOLICITUD.id_VIAJE_SOLICITUD`;
    const result = await this.general(object, query);
    return result;
  }	 


async viajesolinput(
    object,
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
  ) {
    const query = `Exec dbo.SP_UPD_SYNC_VIAJE_SOLICITUD  
${id_viaje_solicitud},   
${id_empleado},   
${id_ciudad_origen},   
${id_ciudad_destino},   
${id_vehiculo_sel},
${id_vehiculo_uso},   
${id_vehiculo_uso_cava},   
${id_vehiculo_tipo},   
${id_vehiculo_tipo_cava},   
${id_empresa},   
${id_empresa_despacho},   
${id_viaje_carga_tipo},   
${id_medida_pieza},   
${fecha_solicitud ? `'${fecha_solicitud}'` : null},   
${fecha_salida ? `'${fecha_salida}'` : null},   
${fecha_salida_estimada ? `'${fecha_salida_estimada}'` : null},   
${fecha_llegada_estimada ? `'${fecha_llegada_estimada}'` : null},
${fecha_llegada ? `'${fecha_llegada}'` : null},
${fecha_entrega ? `'${fecha_entrega}'` : null},
'${guia_numero}',   
'${numero_relacion_gastos}',   
'${factura_guia}',   
'${campo_especial3}',   
'${campo_especial4}',   
'${descripcion}',   
${fecha_embarque ? `'${fecha_embarque}'` : null},   
'${factura_flete}',
'${barco_nro_viaje}',
'${barco_nombre}',
${carga_cargado},
${fecha_factura_flete ? `'${fecha_factura_flete}'` : null},
${fecha_factura_afiliado ? `'${fecha_factura_afiliado}'` : null}, 
${monto_flete_cotizado},
${pieza_cantidad},   
${peso},   
'${peso_medida}',   
${pasajeros},   
${largo},   
${ancho},   
${alto},   
'${longitud_medida}',   
${volumen},   
'${volumen_medida}',   
${repartos_internos},   
${repartos_externos},   
'${observaciones}', 
'${custodia}',
'${marchamo}',
'${marchamo_serial}', 
'${observaciones_viaje}', 
'${tipo_origen}',
'${solicitud_referencia}', 
'${carga_peligrosa}', 
'${usuario}',
${id_empresa_registro},
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null`;
    const result = await this.general(object, query);
    return result;
  }	


async viajesoldelete(
    object,
id_viaje_solicitud,	
  ) {
    const query = `Exec dbo.SP_DEL_SYNC_VIAJE_SOLICITUD  
${id_viaje_solicitud}`;
    const result = await this.general(object, query);
    return result;
  }	


 

  async viajesollistado(object, ID_Empleado, ID_Usuario, ID_Empresa_Sesion) {
   const query = `select 
 VIAJE_SOLICITUD.ID_VIAJE_SOLICITUD,   
VIAJE_SOLICITUD.FECHA_SOLICITUD,  solcampo_fecha_solicitud.ACTIVO as solcampo_fecha_solicitud_act,  solcampo_fecha_solicitud.CAMPO_ORDEN as solcampo_fecha_solicitud_ord,  
solcampo_fecha_solicitud.OBLIGATORIO as solcampo_fecha_solicitud_obl,   
empleado.nombre + ' ' + empleado.apellido as empleado_descripcion,
cliente.nombre as cliente_descripcion,
c1.descripcion as ciudad_origen_descripcion,
c2.descripcion as ciudad_destino_descripcion,
VIAJE_SOLICITUD.MONTO_FLETE_COTIZADO,  solcampo_monto_flete_cotizado.ACTIVO as solcampo_monto_flete_cotizado_act,  solcampo_monto_flete_cotizado.CAMPO_ORDEN as solcampo_monto_flete_cotizado_ord,  solcampo_monto_flete_cotizado.OBLIGATORIO as solcampo_monto_flete_cotizado_obl,   
VIAJE_SOLICITUD.GUIA_NUMERO,   solcampo_guia_numero.ACTIVO as solcampo_guia_numero_act, solcampo_guia_numero.CAMPO_ORDEN as solcampo_guia_numero_ord,  solcampo_guia_numero.OBLIGATORIO as solcampo_guia_numero_obl,    
VIAJE_SOLICITUD.NUMERO_RELACION_GASTOS,    solcampo_numero_relacion_gastos.ACTIVO as solcampo_numero_relacion_gastos_act,  solcampo_numero_relacion_gastos.CAMPO_ORDEN as solcampo_numero_relacion_gastos_ord,  solcampo_numero_relacion_gastos.OBLIGATORIO as solcampo_numero_relacion_gastos_obl,     
VIAJE_SOLICITUD.FACTURA_GUIA,    solcampo_factura_guia.ACTIVO as solcampo_numero_factura_guia_act,   solcampo_factura_guia.CAMPO_ORDEN as solcampo_numero_factura_guia_ord,     solcampo_factura_guia.OBLIGATORIO as solcampo_numero_factura_guia_obl,  
VIAJE_SOLICITUD.CAMPO_ESPECIAL3,    solcampo_campo_especial3.ACTIVO as solcampo_numero_campo_especial3_act,  solcampo_campo_especial3.CAMPO_ORDEN as solcampo_numero_campo_especial3_ord,  solcampo_campo_especial3.OBLIGATORIO as solcampo_numero_campo_especial3_obl,   
VIAJE_SOLICITUD.CAMPO_ESPECIAL4,   solcampo_campo_especial4.ACTIVO as solcampo_numero_campo_especial4_act,   solcampo_campo_especial4.CAMPO_ORDEN as solcampo_numero_campo_especial4_ord,  solcampo_campo_especial4.OBLIGATORIO as solcampo_numero_campo_especial4_obl,   
VIAJE_SOLICITUD.DESCRIPCION,   solcampo_descripcion.ACTIVO as solcampo_descripcion_act,  solcampo_descripcion.CAMPO_ORDEN as solcampo_descripcion_ord,   solcampo_descripcion.OBLIGATORIO as solcampo_descripcion_obl, 
VIAJE_SOLICITUD.FECHA_EMBARQUE,   solcampo_fecha_embarque.ACTIVO as solcampo_fecha_embarque_act,  solcampo_fecha_embarque.CAMPO_ORDEN as solcampo_fecha_embarque_ord,  solcampo_fecha_embarque.OBLIGATORIO as solcampo_fecha_embarque_obl,  
VIAJE_SOLICITUD.fecha_ins, 
VIAJE_SOLICITUD.fecha_mod,  
VIAJE_SOLICITUD.usuario_ins,
VIAJE_SOLICITUD.usuario_mod, 
V_VIAJE_SOLICITUD.id_VIAJE,
viaje_carga_tipo.descripcion  as carga_tipo_descripcion, solcampo_id_viaje_carga_tipo.ACTIVO as solcampo_carga_tipo_act,   solcampo_id_viaje_carga_tipo.CAMPO_ORDEN as solcampo_carga_tipo_ord,  solcampo_id_viaje_carga_tipo.OBLIGATORIO as solcampo_viaje_carga_tipo_obl,    


VIAJE_SOLICITUD.SOLICITUD_REFERENCIA,  solcampo_solicitud_referencia.ACTIVO as solcampo_solicitud_referencia_act,  solcampo_solicitud_referencia.CAMPO_ORDEN as solcampo_solicitud_referencia_ord,   solcampo_solicitud_referencia.OBLIGATORIO as solcampo_solicitud_referencia_obl,

nombre_guia.guia_nombre as guia_numero_etiqueta, 
config_etiqueta_viaje_relgastos.valor as numero_relacion_gastos_etiqueta, 
config_etiqueta_viaje_facturaguia.valor as factura_guia_etiqueta,
config_via_etiqueta_campoespecial3.valor as campo_especial3_etiqueta,
config_via_etiqueta_campoespecial4.valor as campo_especial4_etiqueta


from V_VIAJE_SOLICITUD, VIAJE_SOLICITUD  WITH (NOLOCK)  left outer join empleado WITH (NOLOCK) on VIAJE_SOLICITUD.id_empleado = empleado.id_empleado  
left outer join ciudad as c1 WITH (NOLOCK) on  VIAJE_SOLICITUD.ID_CIUDAD_ORIGEN = c1.id_ciudad  
left outer join ciudad as c2 WITH (NOLOCK) on  VIAJE_SOLICITUD.ID_CIUDAD_DESTINO = c2.id_ciudad  
left outer join empresa as cliente on VIAJE_SOLICITUD.id_empresa = cliente.id_empresa
left outer join viaje_carga_tipo  on VIAJE_SOLICITUD.id_viaje_carga_tipo = viaje_carga_tipo.id_viaje_carga_tipo,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO WITH (NOLOCK) where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'fecha_solicitud') as solcampo_fecha_solicitud,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO WITH (NOLOCK) where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'monto_flete_cotizado') as solcampo_monto_flete_cotizado,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO WITH (NOLOCK) where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'guia_numero') as solcampo_guia_numero,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO WITH (NOLOCK) where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'numero_relacion_gastos') as solcampo_numero_relacion_gastos,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO WITH (NOLOCK) where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'factura_guia') as solcampo_factura_guia,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO WITH (NOLOCK) where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'campo_especial3') as solcampo_campo_especial3,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO WITH (NOLOCK) where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'campo_especial4') as solcampo_campo_especial4,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO WITH (NOLOCK) where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'descripcion') as solcampo_descripcion,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO WITH (NOLOCK) where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'fecha_embarque') as solcampo_fecha_embarque,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO WITH (NOLOCK) where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'solicitud_referencia') as solcampo_solicitud_referencia,
(SELECT VIAJE_SOL_CAMPO.activo, VIAJE_SOL_CAMPO.CAMPO_ORDEN, VIAJE_SOL_CAMPO.OBLIGATORIO FROM VIAJE_SOL_CAMPO where VIAJE_SOL_CAMPO.CAMPO_LAYOUT = 'id_viaje_carga_tipo') as solcampo_id_viaje_carga_tipo,
CONFIGURACION as config_retrieve  WITH (NOLOCK),
(select dbo.F_ETIQUETA_GUIA(0,0) as guia_nombre ) as nombre_guia
, CONFIGURACION as config_etiqueta_viaje_relgastos WITH (NOLOCK) 
, CONFIGURACION as config_etiqueta_viaje_facturaguia WITH (NOLOCK) 
, CONFIGURACION as config_via_etiqueta_campoespecial3 WITH (NOLOCK) 
, CONFIGURACION as config_via_etiqueta_campoespecial4 WITH (NOLOCK)  

where config_retrieve.campo = 'VIAJE_DIASANTERIORES_RETRIEVE'
and config_etiqueta_viaje_relgastos.CAMPO = 'ETIQUETA_VIAJE_RELGASTOS'
and config_etiqueta_viaje_facturaguia.CAMPO = 'ETIQUETA_VIAJE_FACTURAGUIA'
and config_via_etiqueta_campoespecial3.CAMPO = 'VIA_ETIQUETA_CAMPOESPECIAL3'
and config_via_etiqueta_campoespecial4.CAMPO = 'VIA_ETIQUETA_CAMPOESPECIAL4'
and V_VIAJE_SOLICITUD.id_viaje_solicitud = VIAJE_SOLICITUD.id_viaje_solicitud 
and ((viaje_solicitud.fecha_solicitud >= DATEADD(dd, convert(integer, config_retrieve.VALOR) * -1, getdate()) 
and isnull(v_viaje_solicitud.id_VIAJE,0) > 0) or isnull(v_viaje_solicitud.id_VIAJE,0) = 0 )
and (
(VIAJE_SOLICITUD.ID_EMPLEADO = ${ID_Empleado}
and ${ID_Empleado} in (
select USUARIO_X_EMPLEADO.ID_EMPLEADO from USUARIO_X_EMPLEADO WITH (NOLOCK) , USUARIO WITH (NOLOCK) 
where USUARIO_X_EMPLEADO.ID_EMPLEADO = ${ID_Empleado} 
and USUARIO_X_EMPLEADO.ID_USUARIO = usuario.ID_USUARIO
and usuario.ADMINISTRADOR = 0
union all 
select ${ID_Empleado} from TABLA_DUMMY
where ${ID_Empleado} not in (select USUARIO_X_EMPLEADO.ID_EMPLEADO from USUARIO_X_EMPLEADO  WITH (NOLOCK) 
where USUARIO_X_EMPLEADO.ID_EMPLEADO = ${ID_Empleado})
) )  
OR (VIAJE_SOLICITUD.USUARIO_INS = (select USUARIO.DESCRIPCION from USUARIO  WITH (NOLOCK) 
where USUARIO.ID_USUARIO = ${ID_Usuario}))
OR (1 = (select convert(integer,USUARIO.administrador) from USUARIO  WITH (NOLOCK) 
where USUARIO.ID_USUARIO = ${ID_Usuario}))
)
and VIAJE_SOLICITUD.ID_EMPRESA_REGISTRO = ${ID_Empresa_Sesion}
order by VIAJE_SOLICITUD.ID_VIAJE_SOLICITUD desc`;
    const result = await this.general(object, query);
    return result;
  }	

  async ciudades(object) {
    const query =
      `SELECT ciudad.id_ciudad,   
        ciudad.descripcion + ', ' + estado.descripcion  + ' (' + upper( rtrim(pais.abreviatura) ) + ')'  as descripcion
    FROM ciudad WITH (NOLOCK),  estado WITH (NOLOCK), pais  WITH (NOLOCK)
   WHERE  ciudad.activo = 1 and 
estado.id_estado = ciudad.id_estado and  
 pais.id_pais = estado.id_pais 
 order by ciudad.descripcion`;
    const result = await this.general(object, query);
    return result;
  }

  async vehiculousos(object) {
    const query =
      `SELECT vehiculo_uso.id_vehiculo_uso,   
       vehiculo_uso.descripcion
    FROM vehiculo_uso WITH (NOLOCK)  
where vehiculo_uso.aplica_en in ('T', 'C')
order by  vehiculo_uso.descripcion`;
    const result = await this.general(object, query);
    return result;
  }

  async vehiculotipos(object) {
    const query =
      `SELECT vehiculo_tipo.id_vehiculo_tipo,   
         vehiculo_tipo.descripcion,   
         vehiculo_tipo.autodependiente  ,
case vehiculo_tipo.autodependiente when 0 then 'truck16x16.png' else 'trailer16x16.png'  end as dibujo 
    FROM vehiculo_tipo WITH (NOLOCK)  
	order by  vehiculo_tipo.autodependiente,  vehiculo_tipo.descripcion`;
    const result = await this.general(object, query);
    return result;
  }

  async clientes(object) {
    const query =
      `SELECT empresa.id_empresa,     
         empresa.nombre
    FROM empresa WITH (NOLOCK)
   WHERE empresa.activo = 1 and tipo not in ('D', 'A') 
   order by empresa.nombre`;
    const result = await this.general(object, query);
    return result;
  }
  async clientesdespacho(object) {
    const query =
      `SELECT empresa.id_empresa,   
         empresa.nombre
	FROM empresa WITH (NOLOCK)
   WHERE empresa.activo = 1
   order by empresa.nombre`;
    const result = await this.general(object, query);
    return result;
  }	

  async cargatipos(object) {
    const query =
      `SELECT viaje_carga_tipo.id_viaje_carga_tipo,   
         viaje_carga_tipo.descripcion 
    FROM viaje_carga_tipo
	order by viaje_carga_tipo.descripcion`;
    const result = await this.general(object, query);
    return result;
  }

  async piezasmedidas(object) {
    const query =
      `select medida_pieza.id_medida_pieza,   
medida_pieza.descripcion
from medida_pieza
order by medida_pieza.descripcion`;
    const result = await this.general(object, query);
    return result;
  }

  async embarquetipos(object) {
    const query =
      `select null as tipo,
'Nacional' as descripcion union all
select 'I' as tipo,
'Importación' as descripcion union all
select 'E' as tipo, 
'Exportación' as descripcion union all
select 'R' as tipo, 
'Retorno' as descripcion union all
select 'C' as tipo,
'Carrusel IMPO FULL'  as descripcion from configuracion WITH (NOLOCK)
where configuracion.CAMPO = 'CIUDAD_ACTUAL' and configuracion.valor = 'MEDLOG_CR'
union all
select 'M' as tipo, 
'Carrusel IMPO EMPTY'  as descripcion from configuracion WITH (NOLOCK)
where configuracion.CAMPO = 'CIUDAD_ACTUAL' and configuracion.valor = 'MEDLOG_CR'
union all
select 'P' as tipo, 
'Carrusel EXPO FULL'  as descripcion from configuracion WITH (NOLOCK)
where configuracion.CAMPO = 'CIUDAD_ACTUAL' and configuracion.valor = 'MEDLOG_CR' 
union all
select 'T' as tipo, 
'Carrusel EXPO EMPTY'  as descripcion 
from configuracion WITH (NOLOCK)
where configuracion.CAMPO = 'CIUDAD_ACTUAL' and configuracion.valor = 'MEDLOG_CR'`;
    const result = await this.general(object, query);
    return result;
  }

async medidas(object, Tipo_Medida) {
   const query = `select 'Kg.' as desripcion, 'K' as valor from TABLA_DUMMY where '${Tipo_Medida}' = 'P' union all
select 'T.' as desripcion, 'T' as valor from TABLA_DUMMY where '${Tipo_Medida}' = 'P' union all
select 'cm.' as desripcion, 'C' as valor from TABLA_DUMMY where '${Tipo_Medida}' = 'L' union all
select 'm.' as desripcion, 'M' as valor from TABLA_DUMMY where '${Tipo_Medida}' = 'L' union all
select 'Lts.' as desripcion, 'L' as valor from TABLA_DUMMY where '${Tipo_Medida}' = 'V' union all
select 'gal.' as desripcion, 'G' as valor from TABLA_DUMMY where '${Tipo_Medida}' = 'V' union all
select 'm³' as desripcion, 'M' as valor from TABLA_DUMMY where '${Tipo_Medida}' = 'V' union all
select 'ms' as desripcion, 'S' as valor from TABLA_DUMMY where '${Tipo_Medida}' = 'V'`;
    const result = await this.general(object, query);
    return result;
  }	 

	
}
