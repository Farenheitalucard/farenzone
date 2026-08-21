const SITE = 'https://farenzone.pages.dev';
const loginRes = await fetch(`${SITE}/api/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'farenheitalucard@gmail.com', password: 'vKfe2ryi6!3Lxg3x95' }),
});
const { token } = await loginRes.json();
const getRes = await fetch(`${SITE}/api/games`);
const { games } = await getRes.json();
const fs = await import('fs');
fs.writeFileSync('C:\\Users\\Lenovo\\Desktop\\OpenCode\\farenzone\\kv_backup.json', JSON.stringify(games, null, 2));
console.log(`Backup: ${games.length} games`);
