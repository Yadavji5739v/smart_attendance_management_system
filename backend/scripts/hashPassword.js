const bcrypt = require('bcryptjs');

async function main() {
  const password = process.argv.slice(2).join(' ');
  if (!password) {
    console.error('Usage: npm run hash -- <password>');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  console.log(hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

