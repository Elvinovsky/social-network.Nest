import { AuthGuard } from '@nestjs/passport';

export class JwtBearerGuard extends AuthGuard('bearer') {}
