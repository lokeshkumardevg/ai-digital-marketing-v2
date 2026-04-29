import { IsOptional, IsIn } from 'class-validator';

export class QueryLogsDto {
  @IsOptional()
  @IsIn(['5days', '15days', '30days'])
  filter?: '5days' | '15days' | '30days';
}

