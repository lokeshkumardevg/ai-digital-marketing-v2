const mongoose = require('mongoose');

const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  const collection = mongoose.connection.collection('roles');
  
  // List current indexes
  const indexes = await collection.indexes();
  console.log('Current indexes:', indexes);
  
  // Drop index name_1 if it exists
  const hasNameIndex = indexes.some(idx => idx.name === 'name_1');
  if (hasNameIndex) {
    const res = await collection.dropIndex('name_1');
    console.log('Dropped name_1 index:', res);
  } else {
    console.log('name_1 index not found.');
  }
  
  process.exit(0);
}

run().catch(console.error);
