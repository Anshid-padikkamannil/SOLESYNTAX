const removeButtons = document.querySelectorAll('.remove-item');
const plusButtons = document.querySelectorAll(".quantity-plus");
const minusButtons = document.querySelectorAll(".quantity-minus");

plusButtons.forEach(button => {

  button.addEventListener('click', async (e) => {
    
    e.preventDefault();

    const input = button
      .closest(".quantity-group")
      .querySelector('.cart-quantity');
    
    const productId = button.dataset.productId;
    const size = button.dataset.size;


    const oldQuantity = Number(input.value);
    const max = Number(input.max)
    

    if (oldQuantity >= max) return;

    const newQuantity = oldQuantity + 1;

    try {
      
      await updateCart(productId, size, newQuantity);

      // update UI only if backend succeeds
      input.value = newQuantity;

    } catch (err) {
      
      alert(err.message);

      //Keeping the old value if it's fails
      input.value = oldQuantity

    }

  });

});

minusButtons.forEach(button => {

  button.addEventListener('click', async (e) => {

    e.preventDefault();

    const input = button
      .closest('.quantity-group')
      .querySelector('.cart-quantity');

    const productId = button.dataset.productId;
    const size = button.dataset.size;

    const  oldQuantity = Number(input.value);
    
    if (oldQuantity <= 1) return;
    
    const newQuantity = oldQuantity - 1;
    
    try {
      
      await updateCart(productId, size , newQuantity);

      input.value = newQuantity;

    } catch (err) {

      alert(err.message);

      input.value = oldQuantity;
      
    }

  });
  
});

removeButtons.forEach(button => {
  
  button.addEventListener('click', async (e) => {
    
    e.preventDefault();

    const productId = button.dataset.productId;
    const size = button.dataset.size;

    try {
      
      const response = await fetch(`/cart/remove/${productId}/${size}`, {
        method: 'DELETE'
      });

      const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    alert(data.message);

    location.reload();

    } catch (error) {
      alert(error.message)
      console.log(error);
    }
    
  });
});


async function updateCart(productId, size, quantity) {

  const response = await fetch(`/cart/update/${productId}/${size}`,{
    method: 'PUT',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      quantity,
      size
    })

  });

  
    if (response.status === 401) {
      window.location.href =`/users/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;

      return;
    }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
}