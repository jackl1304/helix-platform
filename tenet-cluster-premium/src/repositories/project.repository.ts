import { Injectable } from '@nestjs/common';
import { Project } from './project.entity';

@Injectable()
export class ProjectRepository {
  async create(createProjectDto: any): Promise<any> {
    return new Project(createProjectDto);
  }

  async findAll(): Promise<any> {
    return [];
  }

  async findOne(id: string): Promise<any> {
    return null;
  }

  async update(id: string, updateProjectDto: any): Promise<any> {
    return null;
  }

  async remove(id: string): Promise<any> {
    return null;
  }
}
