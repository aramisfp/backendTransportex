import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateNoveltyInputDto {
  @IsNotEmpty()
  @IsNumber()
  id_actividad_solicitud: number;

  @IsNotEmpty()
  @IsNumber()
  id_vehiculo: number;

  @IsNotEmpty()
  @IsNumber()
  id_actividad_grupo: number;

  @IsNotEmpty()
  @IsNumber()
  id_empleado_solicitud: number;

  @IsNotEmpty()
  @IsBoolean()
  urgente: boolean;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsNotEmpty()
  @IsString()
  usuario_str: string;

  @IsNotEmpty()
  @IsNumber()
  id_empresa_sesion: number;
}
