import {
  IsString,
  Length,
} from 'class-validator';

export class ProsesKeluarDto {
  @IsString()
  @Length(64, 64)
  qr_token!: string;
}