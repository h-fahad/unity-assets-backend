import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, description, slug } = createCategoryDto;
    
    const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    try {
      return await this.prisma.category.create({
        data: {
          name,
          description,
          slug: generatedSlug,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category name or slug already exists');
      }
      throw error;
    }
  }

  async findAll(includeInactive: boolean = false) {
    return this.prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: { assets: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assets: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { assets: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    
    const updateData: any = { ...updateCategoryDto };
    
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      updateData.slug = updateCategoryDto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category name or slug already exists');
      }
      throw error;
    }
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    
    const assetCount = await this.prisma.asset.count({
      where: { categoryId: id },
    });

    if (assetCount > 0) {
      throw new ConflictException('Cannot delete category with existing assets. Move assets to another category first.');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);
    
    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(id: number) {
    await this.findOne(id);
    
    return this.prisma.category.update({
      where: { id },
      data: { isActive: true },
    });
  }
}