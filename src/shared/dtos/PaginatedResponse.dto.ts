import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDTO<T> {
  @ApiProperty({ default: 1 })
  page: number;

  @ApiProperty({ default: 1 })
  totalPages: number;

  @ApiProperty()
  data: T[];
}
