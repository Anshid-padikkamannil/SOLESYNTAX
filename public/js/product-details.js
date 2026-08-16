const addToCartBtn = document.getElementById("addToCartBtn");

const sizeOptions = document.querySelectorAll('.size-option');

let selectedSize = null;


addToCartBtn.addEventListener('click', async () => {
  const productId = addToCartBtn.dataset.productId;

  const quantity = document.getElementById('quantity').value;

  if (!selectedSize) {
      showToast('Please select a size', 'warning', '⚠️');
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

    if (response.ok) {
    showSwal('success', 'Added to Cart!', data.message || 'Your item has been added.');
    } else {
      showSwal('error', 'Oops...', data.message || 'Unable to add to cart.');
    }
    
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