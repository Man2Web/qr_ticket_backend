const axios = require("axios");

async function sendWhatsapp(phone_number, transaction_id) {
  try {
    let data = JSON.stringify({
      token: "gG4xW1qJqxtKs3DVID74TPFaQiB66D5CZb7UXC8z24ff6012",
      phone: `91${phone_number}`,
      template_name: "registration_link",
      template_language: "en",
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: `${transaction_id}`,
            },
            {
              type: "text",
              text: `https://api.ticket.nammaooruangadi.com/tickets/view/pdf?id=${transaction_id}`,
            },
          ],
        },
      ],
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://wa.tryowbot.com/api/wpbox/sendtemplatemessage",
      headers: {
        "Content-Type": "application/json",
        Cookie:
          "XSRF-TOKEN=eyJpdiI6IlpnYVdZbGY4aTN2K0JYYng4bnl3b3c9PSIsInZhbHVlIjoiaFN3TnRjVW5reUw2YjZubnBkdmRoWGtYWXQ0dWpsNXVyK3ZqVnVhNklEckhKVlMxTlg0ZVdWM3dSbDdMcHVRU3pac2l6UFpmWWdkd3JWM3BwYTU4UTBpL0FKQ0xkeEpyQWxYSERNbnpqL3c3WUsybkxNbjJ4bkdXMWRVcXlHM3AiLCJtYWMiOiJmZTRkMTljYTczM2NlMDBmNDg3Mjg3ZTNjMDZlMzNkNGViNDgzYzQyNzJmOGMyNGY3NGMwZTFjYzgzZGRlM2NiIiwidGFnIjoiIn0%3D; tryowbot_session=eyJpdiI6ImorVEl0ei9Mb0Q3ZUJqRVhCVHMyMFE9PSIsInZhbHVlIjoiNytXd3NyNnRCZVpIdE52MHdFb2FBSTJBTk1ycS93UGpXZ08yOFZaeDJ6dWdGdXZ3Sm5IdW1rRmRTbnplQmtKUEFxMk5kWkZTQXZUR3VuOXdTcm8xV1ZOYUJ4MXRPeW8zS3dYVDdaZFovclM3MXF4aEFidFR6bEVLRFNqRjVhWHkiLCJtYWMiOiI4MjM5YjMxMzg4MWViZGU5MTg2MTlhNzA5ZTUzYzc5ODY1MTYwMjNiNTc5OWYxMDE4ZDk5ODdkZWJiY2NkOWZhIiwidGFnIjoiIn0%3D",
      },
      data: data,
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

module.exports = sendWhatsapp;
