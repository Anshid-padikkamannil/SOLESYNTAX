const addToCartBtn = document.getElementById("addToCartBtn");

const sizeOptions = document.querySelectorAll('.size-option');

let selectedSize = null;


addToCartBtn.addEventListener('click', async () => {
  const productId = addToCartBtn.dataset.productId;

  const quantity = document.getElementById('quantity').value;

  if (!selectedSize) {
    alert("Please select a size.");
    return;
  }

  try {
    
    const response = await fetch('/cart/add-to-cart', {
      method: 'POST',
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId,
        quantity: parseInt(quantity),
        size: selectedSize
      })
    });

    const data = await response.json();

    console.log(data);
    
  } catch (error) {

    console.error(error);
  }
  
});


sizeOptions.forEach(option => {
  option.addEventListener('click', function (e) {
    e.preventDefault();

    selectedSize = Number(this.dataset.size);

    console.log("Selected Size:", selectedSize);
  });
});