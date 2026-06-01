const fs = require('fs');
const file = 'backend/src/campaigns/campaigns.module.ts';
let code = fs.readFileSync(file, 'utf8');
if (!code.includes('UsersModule')) {
  code = "import { UsersModule } from '../users/users.module';\n" + code;
  code = code.replace('imports: [', 'imports: [\n    UsersModule,');
  fs.writeFileSync(file, code);
}
