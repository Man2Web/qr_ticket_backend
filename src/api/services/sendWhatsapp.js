const axios = require("axios");

const token = "gG4xW1qJqxtKs3DVID74TPFaQiB66D5CZb7UXC8z24ff6012";
const credit = 2;
const sender = "NANGAD";
const templateId = "1707173396771544479";
const templateName = "registration";

async function sendWhatsapp(phone_number, transaction_id) {
  try {
    let data = JSON.stringify({
      token: token,
      phone: `91${phone_number}`,
      template_name: templateName,
      template_language: "en",
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: transaction_id,
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
          "XSRF-TOKEN=eyJpdiI6IlIva05CelppS1hXWDdGSTRYNXl6YVE9PSIsInZhbHVlIjoiV0oxRjUwVWtsUzBmMzkva2ZidG9rWW5acXREa2E2NjZkeS9kUE13cTdxNXp6RlVCeERCQ0JVL0EzVkdoclV5QXdsbmZzVXArell4MFk0VXBOMzF2ZUhNeDlmZjJ6UTN0TzhvVkhPcm9tWXhvTHdNcENmc1dIZUo3TkpBSTZLSXIiLCJtYWMiOiJhZTdkOGE2YWY5MWJhY2E5MDFjZDEyMGU4NjJjNmQxMzE2MjljNTIwYWY1NmEyOTc1YjBlM2NjNjUwOThmMmVjIiwidGFnIjoiIn0%3D; tryowbot_session=eyJpdiI6Imc5c3NkdkdOK2N2ZFN1Wk9kVHQxVGc9PSIsInZhbHVlIjoiWlpaVi9YSlJGTVJnWlVlNVMzQWNBZDdSclhoVzYyOUJ1WE8zUUJXR1ZUM1FGTE15NmM2UmJibTR2cmJTdDBDR3NNMmVOZWRDQUF3bEFPYXNFM0kzQzczRVhReEVEb2xFWmwweWlkaVlZQkl0ejE4SVhqRUNMSzdRWktFMlRaNFIiLCJtYWMiOiJhNGIzMjQ1MGU5N2I4M2MxNDgxM2E3YTdhMTc0NDRmYTc2MjQ4NDY0NTNmMjE1MmQ1MzZkOWE2MWViYzgyNzhiIiwidGFnIjoiIn0%3D",
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
