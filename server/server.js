const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { APIContracts, APIControllers } = require('authorizenet');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/payment', (req, res) => {
  console.log("Received request:", req.body);

  const { cardNumber, expMonth, expYear, cvv, amount } = req.body;

  const merchantAuthentication = new APIContracts.MerchantAuthenticationType();
  merchantAuthentication.setName(process.env.API_LOGIN_ID);
  merchantAuthentication.setTransactionKey(process.env.TRANSACTION_KEY);

  const creditCard = new APIContracts.CreditCardType();
  creditCard.setCardNumber(cardNumber);
  creditCard.setExpirationDate(`${expMonth}${expYear.slice(2)}`);
  creditCard.setCardCode(cvv);

  const paymentType = new APIContracts.PaymentType();
  paymentType.setCreditCard(creditCard);

  const transactionRequest = new APIContracts.TransactionRequestType();
  transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
  transactionRequest.setPayment(paymentType);
  transactionRequest.setAmount(parseFloat(amount));

  const createRequest = new APIContracts.CreateTransactionRequest();
  createRequest.setMerchantAuthentication(merchantAuthentication);
  createRequest.setTransactionRequest(transactionRequest);

  const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
  ctrl.setEnvironment('https://apitest.authorize.net/xml/v1/request.api'); // ✅ Sandbox environment

  ctrl.execute(() => {
    const apiResponse = ctrl.getResponse();
    const response = new APIContracts.CreateTransactionResponse(apiResponse);

    console.log("Raw API response:", JSON.stringify(apiResponse, null, 2));

    if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
      const transactionResponse = response.getTransactionResponse();
      if (transactionResponse.getMessages()) {
        return res.json({
          success: true,
          message: transactionResponse.getMessages().getMessage()[0].getDescription(),
          transactionId: transactionResponse.getTransId()
        });
      } else {
        return res.status(400).json({
          success: false,
          message: transactionResponse.getErrors().getError()[0].getErrorText()
        });
      }
    } else {
      const error = response.getMessages().getMessage()[0];
      return res.status(400).json({
        success: false,
        message: error.getText(),
        code: error.getCode()
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
