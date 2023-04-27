import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty()
  @MinLength(5)
  @IsString()
  @ApiProperty({ required: true })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  @ApiProperty({ required: false })
  description?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  body: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    required: false,
    default: false,
  })
  published?: boolean;
}
