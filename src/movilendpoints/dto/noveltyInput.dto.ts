import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
  @IsNumber()
  urgente: number;

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
export class EditNoveltyInputDto {
  @IsNotEmpty()
  @IsNumber()
  id_actividad_solicitud: number;

  @IsNotEmpty()
  @IsNumber()
  urgente: number;

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

export class DeleteNoveltyInputDto {
  @IsNotEmpty()
  @IsNumber()
  id_actividad_solicitud: number;

  @IsNotEmpty()
  @IsString()
  usuario_str: string;

  @IsNotEmpty()
  @IsNumber()
  id_empresa_sesion: number;
}

export class UploadedItemDto {
  @IsString()
  name: string;
  @IsString()
  id_key_modulo: number;
  @IsString()
  usuario_str: string;

  @Type(() => String)
  file: string;
}
