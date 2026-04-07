const { execSync } = require('child_process');
process.env.DATABASE_URL = 'postgres://postgres.amtmshwlakeymeslxaed:DmbZsFlAzbqdHWCJ@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';
console.log('Sincronizando banco de dados...');
execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
console.log('Banco de dados sincronizado com sucesso!');
