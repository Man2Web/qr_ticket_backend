const axios = require("axios");

async function sendMessage(phone_number, transaction_id) {
  try {
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://pay4sms.in/sendsms/?token=9131fe66b78233e822d92601746431c1&credit=2&sender=NANGAD&message=NAMMA OORU ANGADI Registration No:${transaction_id} You can access your tickets from the PDF or you can view the tickets from the below mentioned link: https://api.ticket.nammaooruangadi.com/tickets/view/pdf?id=${transaction_id} Thank You, Team ANGADI.&number=${phone_number}&templateid=1707173457573356003`,
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
