table: users
attributes: 
  - user_key: integer
  - username: string
  - password: string
  - email: string
  - role: enum('operator', 'driver')
  - created_at: datetime
  - updated_at: datetime

table: tarrifs
attributes:
  - tariff_key: integer
  - name: string
  - valid_from: datetime
  - valid_to: datetime
  - price: decimal

table: discounts
attributes:
  - discount_key: integer
  - code: string
  - discount: decimal
  - unit: enum('percent', 'fixed')
  - expiration_date: datetime

table: user_discounts
attributes:
  - user_discount_key: integer
  - user_key: integer
  - discount_key: integer

table: parking
attributes:
  - parking_key: integer
  - time_in: datetime
  - time_out: datetime
  - license_plate: string
  - user_key: integer
  - tariff_key: integer
  - final_price: decimal
  - payment_status: enum('pending', 'paid', 'failed')

table: parking_discounts
attributes:
  - parking_discount_key: integer
  - parking_key: integer
  - discount_key: integer

relationships:
  - parking.user_key -> users.user_key
  - parking.tariff_key -> tariffs.tariff_key
  - users.user_key -> user_discounts.user_key
  - user_discounts.discount_key -> discounts.discount_key
  - user_discounts.user_key -> users.user_key
  - parking_discounts.parking_key -> parking.parking_key
  - parking_discounts.discount_key -> discounts.discount_key