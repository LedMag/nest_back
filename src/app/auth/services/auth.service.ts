import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../models/user.model';
import { PayloadToken } from '../models/token.model';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, password: string) {
    const users: User[] = [
      {
        email: 'lusine@gmail.com',
        password: 'lusine2023',
        role: 'admin',
        id: 1,
      },
      {
        email: 'mago@gmail.com',
        password: 'mago2023',
        role: 'admin',
        id: 2,
      },
    ];
    const user: User = users.find(
      (x) => x.email === email && x.password === password,
    );

    if (user) return user;

    return null;
  }

  generateJWT(user: User) {
    const payload: PayloadToken = { role: user.role, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}