url :: POST /reputation/leads

request ::

 {
  "firstName": "Rahul",
  "lastName": "Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "brandId": "your-brand-id",
  "source": "website",
  "requirements": "3BHK in Noida",
  "budget": "80 Lakhs"
}


{
  "success": true,
  "customerId": "665abc...",
  "data": { "firstName": "Rahul", "email": "rahul@example.com", ... }
}