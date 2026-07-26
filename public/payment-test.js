// Buttons
const createOrderBtn = document.getElementById("createOrderBtn");
const payBtn = document.getElementById("payBtn");

// Result fields
const appOrderIdText = document.getElementById("appOrderId");
const razorpayOrderIdText = document.getElementById("razorpayOrderId");
const paymentIdText = document.getElementById("paymentId");
const signatureText = document.getElementById("signature");
const statusText = document.getElementById("status");

// Store payment information
let paymentData = {};

createOrderBtn.addEventListener("click", createOrder);
payBtn.addEventListener("click", openRazorpayCheckout);

async function createOrder() {
  try {

    statusText.textContent = "Creating order...";

    const response = await fetch("/api/order", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        paymentMethod: "Razorpay"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    paymentData.appOrderId = data.order._id;

    appOrderIdText.textContent = paymentData.appOrderId;

    statusText.textContent = "Order created successfully.";

    console.log("App Order ID:", paymentData.appOrderId);

    const razorpayResponse = await fetch("/api/payment/create-order", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        orderId: paymentData.appOrderId
      })
    });

    const razorpayData = await razorpayResponse.json();

    console.log(razorpayData);

    if (!razorpayResponse.ok) {
      throw new Error(razorpayData.message);
    }

    // Save Razorpay information
    paymentData.key = razorpayData.key_id;
    paymentData.razorpayOrder = razorpayData.order;

    // Display Razorpay Order ID
    razorpayOrderIdText.textContent = razorpayData.order.id;

    // Enable Pay button
    payBtn.disabled = false;

    statusText.textContent = "Order ready. Click Pay Now.";

  } catch (error) {

    statusText.textContent = error.message;
    console.error(error);

  }
  
}

function openRazorpayCheckout() {
  try {
    const options = {
      key: paymentData.key,
      amount: paymentData.razorpayOrder.amount,
      currency: paymentData.razorpayOrder.currency,
      order_id: paymentData.razorpayOrder.id,

      handler: async function (response) {

        paymentData.paymentId = response.razorpay_payment_id;
        paymentData.signature = response.razorpay_signature;

        paymentIdText.textContent = response.razorpay_payment_id;
        signatureText.textContent = response.razorpay_signature;

        statusText.textContent = "Verifying payment...";

        const verifyResponse = await fetch("/api/payment/verify", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                appOrderId: paymentData.appOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
            })
        });

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok) {
            throw new Error(verifyData.message);
        }

        statusText.textContent = "Payment Verified Successfully!";
      }
    };

    const razorpay = new Razorpay(options);
    razorpay.open();

  } catch (error) {
    statusText.textContent = error.message;
    console.error(error);
  }
}