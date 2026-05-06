import { Inject } from '@nestjs/common';

export const InjectDatabase = (configTag = 'default') => {
  return Inject(configTag);
};