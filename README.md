# @qavajs/steps-gmail
Step library to test email via gmail client

## Installation

`npm install @qavajs/steps-gmail`

## Configuration
```javascript
module.exports = {
    default: {
        require: ['node_modules/@qavajs/steps-gmail/index.js'],
        gmail: {
            timeout: 30000, // timeout to wait email delivery
            interval: 5000 // interval to check email delivery
        }
    }
}
```
