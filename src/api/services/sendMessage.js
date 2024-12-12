const axios = require("axios");

const token = "9131fe66b78233e822d92601746431c1";
const credit = 2;
const sender = "NANGAD";
const templateId = "1707173396771544479";

async function sendMessage(phone_number, transaction_id) {
  try {
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://pay4sms.in/sendsms/?token=${token}&credit=${credit}&sender=${sender}&message=NAMMA OORU ANGADI\nRegistration No: ${transaction_id} \nPlease show this SMS for a seamless check-in experience. Thank you,\nTeam ANGADI&number=${phone_number}&templateid=${templateId}`,
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}

module.exports = sendMessage;
