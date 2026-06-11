#!/bin/bash
export $(grep -v '^#' backend/.env | xargs)
TOKEN=$(node -e "
const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
MongoClient.connect(uri).then(c => {
  c.db().collection('users').findOne({googleAccessToken: {\$exists:true}}).then(u => {
    console.log(u.googleAccessToken);
    process.exit(0);
  });
});
")
echo "Token: ${TOKEN:0:10}..."

curl -i -X GET "https://googleads.googleapis.com/v17/customers:listAccessibleCustomers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "developer-token: $GOOGLE_DEVELOPER_TOKEN" \
  -H "Content-Type: application/json"
