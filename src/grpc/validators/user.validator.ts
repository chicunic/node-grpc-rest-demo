import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

// Get User Request DTO (for ID validation)
export class GetUserRequestDto {
  @IsNotEmpty({ message: 'id is required' })
  @IsString({ message: 'id must be a string' })
  @IsUUID('4', { message: 'id must be a valid UUID v4' })
  id!: string;
}

// Create User Request DTO
export class CreateUserRequestDto {
  @IsNotEmpty({ message: 'username is required' })
  @IsString({ message: 'username must be a string' })
  @MinLength(3, { message: 'username must be at least 3 characters' })
  @MaxLength(50, { message: 'username must be at most 50 characters' })
  username!: string;

  @IsNotEmpty({ message: 'email is required' })
  @IsString({ message: 'email must be a string' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email!: string;

  @IsNotEmpty({ message: 'full_name is required' })
  @IsString({ message: 'full_name must be a string' })
  @MaxLength(100, { message: 'full_name must be at most 100 characters' })
  full_name!: string;
}

// Update User Data DTO
export class UpdateUserDataDto {
  @IsOptional()
  @IsString({ message: 'username must be a string' })
  @MinLength(3, { message: 'username must be at least 3 characters' })
  @MaxLength(50, { message: 'username must be at most 50 characters' })
  username?: string;

  @IsOptional()
  @IsString({ message: 'email must be a string' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'full_name must be a string' })
  @MaxLength(100, { message: 'full_name must be at most 100 characters' })
  full_name?: string;

  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean' })
  @Type(() => Boolean)
  is_active?: boolean;
}

// Update User Request DTO
export class UpdateUserRequestDto {
  @IsNotEmpty({ message: 'id is required' })
  @IsString({ message: 'id must be a string' })
  @IsUUID('4', { message: 'id must be a valid UUID v4' })
  id!: string;

  @IsNotEmpty({ message: 'data is required' })
  @ValidateNested()
  @Type(() => UpdateUserDataDto)
  data!: UpdateUserDataDto;
}

// Delete User Request DTO (for ID validation)
export class DeleteUserRequestDto {
  @IsNotEmpty({ message: 'id is required' })
  @IsString({ message: 'id must be a string' })
  @IsUUID('4', { message: 'id must be a valid UUID v4' })
  id!: string;
}

// List Users Request DTO
export class ListUsersRequestDto {
  @IsOptional()
  @IsString({ message: 'sort_by must be a string' })
  sort_by?: string;

  @IsOptional()
  @IsString({ message: 'filter must be a string' })
  @MaxLength(100, { message: 'filter must be at most 100 characters' })
  filter?: string;

  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  @Max(10000, { message: 'page must be at most 10000' })
  page!: number;

  @IsInt({ message: 'page_size must be an integer' })
  @Min(1, { message: 'page_size must be at least 1' })
  @Max(100, { message: 'page_size must be at most 100' })
  page_size!: number;
}
