layout: default
content:
 - header:
   - logo (image)
   - Parkoid (text, title)
   - nav:
     - language switcher (icon globe - modal window)
       - language options:
         - Česky
         - English
     - hamburger menu (icon bars - open side menu from left)
       - menu:
         - sign up
         - sign in
 - main
   - page content
 - footer
   - copyright notice
   - terms of service link


page: home.html
content: 
   - welcome text
   - features
   - big input for license plate number
   - button to start pay for parking service
     - action: open payment new section on the same page
     - payment section:
       - time in (date and time from DB)
       - time out (current date and time)
       - final price
       - Add dicscout code button
         - action: open modal window to select or eneter discount code
       - credit card input fields
         - card number
         - expiration date
         - CVV
       - pay button
         - action: submit payment and show success message
   - about section
   - price list section
   - faq section
   - contact section

page: sign_up.html
content:
   - form:
     - input: email
     - input: username
     - input: password
     - button: sign up
   - link to sign in page
   - link to home page

page: sign_in.html
content:
   - form:
     - input: email
     - input: password
     - button: sign in
   - link to sign up page
   - link to forgot password page
   - link to home page

page: forgot_password.html
content:
   - form:
     - input: email
     - button: send reset link
   - link to sign in page
   - link to sign up page
   - link to home page

page: reset_password.html
content:
   - form:
     - input: email
     - input: new password
     - input: confirm new password
     - button: reset password

page: account.html
content:
   - user info section:
     - email
     - username
     - role
   - parking history section:
     - list of past parking sessions with details:
       - time in
       - time out
       - license plate
       - final price
       - payment status
     - discounts section:
       - add discount code button
         - action: open modal window to enter discount code
       - list of available discounts with details:
         - code
         - discount amount
         - unit
         - expiration date

page: dashboard.html
content:
   - Barrier management section:
     - Open barrier (button)
       - action: open barrier by API request
     - Close barrier (button)
       - action: close barrier by API request
   - Tarrif management section:
     - list of tariffs with details:
       - name
       - valid from
       - valid to
       - price
       - edit button
         - action: open modal window to edit tariff details
       - delete button
         - action: delete tariff by API request
     - add tariff button
       - action: open modal window to enter new tariff details
       - form:
         - input: name
         - input: valid from
         - input: valid to
         - input: price
         - button: add tariff
           - action: submit new tariff by API request
   - Discount management section: 
     - list of discounts with details:
       - code
       - discount amount
       - unit
       - expiration date
       - edit button
         - action: open modal window to edit discount details
       - delete button
         - action: delete discount by API request
     - add discount button
       - action: open modal window to enter new discount details
       - form:
         - input: code
         - input: discount amount
         - input: unit
         - input: expiration date
         - button: add discount
           - action: submit new discount by API request
   - Parking history section:
     - list of past parking sessions with details:
       - time in
       - time out
       - license plate
       - final price
       - payment status