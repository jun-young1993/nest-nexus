import { CreateThreeObjectDto } from '../dto/create-three-object.dto';
import { ThreeObject } from '../entities/three-object.entity';

export class ThreeObjectMapper {
  static toEntity(dto: CreateThreeObjectDto): Partial<ThreeObject> {
    return {
      id: dto.id,
      type: dto.type,
      positionX: dto.position.x,
      positionY: dto.position.y,
      positionZ: dto.position.z,
      rotationX: dto.rotation.x,
      rotationY: dto.rotation.y,
      rotationZ: dto.rotation.z,
      scaleX: dto.scale.x,
      scaleY: dto.scale.y,
      scaleZ: dto.scale.z,
    };
  }
}
