# payercoins-backend
This is the repository that hosts all of payercoins backend services
#### Installation

- Clone the repository


git clone project-link


- Install dependencies


cd project-name
1. Install All dependecies  
```
npm install or yarn install
```
2. Setup your local .env file from the env.example file.

3. Check migration status, run in your cli
```
migrate-mongo status
```

4. To make migration, run migrate-mongo create with  your desired name, example below
```
migrate-mongo create modify-user-table
```

5. you can check the Migration status again

6. To commit the migration run
```
migrate-mongo up
```
7. To Revert Migrations run
```
migrate-mongo down
```



Please check package.json for other useful npm scripts

#### Documentation link

[Postman docs](https://documenter.getpostman.com/view/8996154/TzskEiKZ)
[Checkout docs](https://documenter.getpostman.com/view/16783603/Uyr7HJX9)

#### How to Add New Coin
- Open treshold-keys 
- Get the env value of the wallet e.g TRESHOLD_BNB_HOT_WALLET_ID
- Open crypto-module .env and duplicate the sandbox and live cold and hot keys of the last coin
- Update the wallet credentials
- Open seed-crypto-data.js and update the coins data in addNewCoin function, copy and paste the new entry in seed function
- Run node seed-crypto-data.js to add the new coin to db

## Technologies:
- API - Node JS
- File Upload: Cloudinary
- Mailer: Nodemailer