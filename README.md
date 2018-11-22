# node-pizza-api

Tasks:

1# New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.

2# Users can log in and log out by creating or destroying a token.

3# When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system).

4# A logged-in user should be able to fill a shopping cart with menu items

5# A logged-in user should be able to create an order. You should integrate with the Sandbox of Stripe.com to accept their payment. Note: Use the stripe sandbox for your testing.

6# When an order is placed, you should email the user a receipt. You should integrate with the sandbox of Mailgun.comfor this.

Important Note: You must write your API calls from scratch.

#APIs Documentation and examples

For create, edit and delete a user:

### Creating a user `POST` /users

- Required data: `name`, `email address`, `street address`
- Optional data: none

```
curl -X POST \
  http://127.0.0.1:3000/users \
  -d '{

         "name": "Adam Kowalski",
         "email": "kowalskikowalski@gmail.com",
         "street": "Kozuchowska 30"

}'
```

### Editing a user `PUT` /users

- Required data: `email`
- Optional data: `name` || `street`

- For editing, the user needs to `/tokens` first, which will create `token` for this user.
- `email` is mandatory, `address`, `name` are optional but at least one need to be present.

```
curl -X PUT \
  http://localhost:3000/users?email=kowalskikowalski@gmail.com"\
  -H 'token: id'
  -d '{
    "name": "Roman Kowalski",
    "email": "kowalskikowalski@gmail.com",
    "street": "Kozuchowska 30"
}'
```

### Deleting a user `DELETE` /users

- Required data: `email`
- Optional data: none

- For deleting, the user needs to `/tokens` first, which will create `token` for this user.

```
curl -X DELETE \
  http://localhost:3000/users?email=kowalskikowalski@gmail.com" \
  -H 'token: id'
```

## Login create a token `POST` /token

- Required data: `email`
- Optional data: none

```
curl -X POST \
  http://localhost:3000/tokens\
  -d '{
	 "email": "kowalskikowalski@gmail.com"
}'
```

## Logout delete a token `DELETE` /token

- Required data: `id`
- Optional data: none

* For logging out, the user needs to `/token` first, which will provide `token`.

```
curl -X DELETE \
  http://localhost:3000/logout \
 -H 'token: id'
```

## Get all menu items `GET` /menuitems

- Required data: pizzaMenu
- Optional data: none

- For getting a menu itmes, the user needs to `/token` first, which will provide `token`.

```
 curl -X GET \
  http://localhost:3000/menuitems \
  -H 'token: id'
```

## Shopping cart adding items from menu items `POST` /shoppingcart

- Required data: `email`
- Optional data: none

* For adding items to the shopping cart, the user needs to `/token` first, which will provide `token`.

```
curl -X POST \
  http://localhost:3000/shoppingcart \
  -H 'token: xxxxxxxxxxxxxx' \
  -d '{

        "email": "kowalskikowalski@gmail.com",
        "pizzaId": 5,
        "quantity": 2
}'
```

## Create and pay order `POST` /orders

- Required data: `email`
- Optional data: none

- For create and pay fort the order, first user need to have items in shopping cart, second the user needs to `/token`, which will provide `token`.

Payment will be made using sandboxStripe:
https://stripe.com/docs/quickstart

```
curl -X POST \
  http://localhost:3000/orders \
  -H 'token: id' \
  -d '{
	"email": "kowalskikowalski@gmail.com"
}'
```

When the payments will be finished and approve then you receive email from sandbox mailgun. In this email you will be receive all data about order.
