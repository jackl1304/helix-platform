import { Injectable } from '@nestjs/common';
import { ProjectRepository } from './project.repository';

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async create(createProjectDto: any): Promise<any> {
    return this.projectRepository.create(createProjectDto);
  }

  async findAll(): Promise<any> {
    return this.projectRepository.findAll();
  }

  async findOne(id: string): Promise<any> {
    return this.projectRepository.findOne(id);
  }

  async update(id: string, updateProjectDto: any): Promise<any> {
    return this.projectRepository.update(id, updateProjectDto);
  }

  async remove(id: string): Promise<any> {
    return this.projectRepository.remove(id);
  }
}
