import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>) {}

  findByUsername(username: string) {
    return this.model.findOne({ username: username.toLowerCase() }).exec();
  }

  findById(id: string) {
    return this.model.findById(id).exec();
  }

  create(username: string, passwordHash: string) {
    return this.model.create({ username: username.toLowerCase(), passwordHash, refreshTokenHash: null });
  }

  async setRefreshHash(id: string, hash: string | null) {
    const r = await this.model.updateOne({ _id: id }, { $set: { refreshTokenHash: hash } }).exec();
    if (r.matchedCount === 0) throw new NotFoundException('User not found');
  }
}
