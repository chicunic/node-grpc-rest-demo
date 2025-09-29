import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

// Get Product Request DTO (for ID validation)
export class GetProductRequestDto {
  @IsNotEmpty({ message: 'id is required' })
  @IsString({ message: 'id must be a string' })
  @IsUUID('4', { message: 'id must be a valid UUID v4' })
  id!: string;
}

// Create Product Request DTO
export class CreateProductRequestDto {
  @IsNotEmpty({ message: 'name is required' })
  @IsString({ message: 'name must be a string' })
  @MaxLength(100, { message: 'name must be at most 100 characters' })
  name!: string;

  @IsNotEmpty({ message: 'description is required' })
  @IsString({ message: 'description must be a string' })
  @MaxLength(500, { message: 'description must be at most 500 characters' })
  description!: string;

  @IsNotEmpty({ message: 'price is required' })
  @IsInt({ message: 'price must be an integer' })
  @Min(0, { message: 'price cannot be negative' })
  @Max(99999999, { message: 'price cannot exceed 99,999,999' })
  price!: number;

  @IsNotEmpty({ message: 'quantity is required' })
  @IsInt({ message: 'quantity must be an integer' })
  @Min(0, { message: 'quantity cannot be negative' })
  @Max(99999, { message: 'quantity cannot exceed 99,999' })
  quantity!: number;

  @IsNotEmpty({ message: 'category is required' })
  @IsString({ message: 'category must be a string' })
  @MaxLength(50, { message: 'category must be at most 50 characters' })
  category!: string;
}

// Search Products Request DTO
export class SearchProductsRequestDto {
  @IsOptional()
  @IsString({ message: 'query must be a string' })
  @MaxLength(100, { message: 'query must be at most 100 characters' })
  query?: string;

  @IsOptional()
  @IsString({ message: 'category must be a string' })
  @MaxLength(50, { message: 'category must be at most 50 characters' })
  category?: string;

  @IsOptional()
  @IsInt({ message: 'min_price must be an integer' })
  @Min(0, { message: 'min_price cannot be negative' })
  min_price?: number;

  @IsOptional()
  @IsInt({ message: 'max_price must be an integer' })
  @Min(0, { message: 'max_price cannot be negative' })
  max_price?: number;

  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  @Max(10000, { message: 'page must be at most 10000' })
  page!: number;

  @IsInt({ message: 'page_size must be an integer' })
  @Min(1, { message: 'page_size must be at least 1' })
  @Max(100, { message: 'page_size must be at most 100' })
  page_size!: number;
}
