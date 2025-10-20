import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';

export default TypeOrmModule.forRoot({
  type: 'sqlite',
  database: 'tenet-cluster-premium.db',
  entities: [Project],
  synchronize: true,
});
